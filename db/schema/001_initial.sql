CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id     VARCHAR(255) NOT NULL UNIQUE,
    kyc_status      VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_external_id ON users(external_id);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);

CREATE TABLE wallets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address         VARCHAR(42) NOT NULL,
    is_primary      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(address)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(address);

CREATE TABLE holdings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    equity_units    NUMERIC(78, 0) NOT NULL CHECK (equity_units >= 0),
    effective_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    source          VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_holdings_user_id ON holdings(user_id);
CREATE INDEX idx_holdings_effective_at ON holdings(effective_at);

CREATE TABLE proposals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(500) NOT NULL,
    description         TEXT NOT NULL,
    quorum_bps          INTEGER NOT NULL CHECK (quorum_bps > 0 AND quorum_bps <= 10000),
    contract_address    VARCHAR(42),
    status              VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_contract_address ON proposals(contract_address);

CREATE TABLE stake_snapshots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id     UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    wallet_address  VARCHAR(42) NOT NULL,
    stake_amount    NUMERIC(78, 0) NOT NULL CHECK (stake_amount > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(proposal_id, wallet_address)
);

CREATE INDEX idx_stake_snapshots_proposal_id ON stake_snapshots(proposal_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER holdings_updated_at BEFORE UPDATE ON holdings
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
