-- Certified result, written when the admin ends voting.
-- Powers are NUMERIC(78,0) like stakes: uint256-safe, returned as strings.
ALTER TABLE proposals
    ADD COLUMN yes_power   NUMERIC(78, 0),
    ADD COLUMN no_power    NUMERIC(78, 0),
    ADD COLUMN quorum_met  BOOLEAN,
    ADD COLUMN ended_at    TIMESTAMPTZ;
