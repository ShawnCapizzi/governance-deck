-- Canonical Governance Deck seed. Run with the service role.
-- Card codes match lib/deck.ts and governance-core-deck.md. Extend to the
-- full 23-card set from governance-core-deck.md during production hardening.

insert into decks (id, scope, name, version, status) values
  ('00000000-0000-0000-0000-00000000d001', 'canonical', 'Capizzi Governance Deck', 1, 'published');

insert into suits (id, deck_id, name, pillar, artifact_key, sort) values
  ('00000000-0000-0000-0000-00000000a001', '00000000-0000-0000-0000-00000000d001', 'Signals', 'listen_first', 'truth-signals.md', 1),
  ('00000000-0000-0000-0000-00000000a002', '00000000-0000-0000-0000-00000000d001', 'Bounds', 'make_it_visible', 'guardrails.md', 2),
  ('00000000-0000-0000-0000-00000000a003', '00000000-0000-0000-0000-00000000d001', 'Trace', 'prove_it_worked', 'rollback-rules.md', 3),
  ('00000000-0000-0000-0000-00000000a004', '00000000-0000-0000-0000-00000000d001', 'Spine', 'continuity', 'change-protocol.md', 4),
  ('00000000-0000-0000-0000-00000000a005', '00000000-0000-0000-0000-00000000d001', 'Diagnostic', 'prove_it_worked', 'insights', 5);

insert into cards (suit_id, kind, response_type, prompt, options, artifact_mapping, code, sort) values
  ('00000000-0000-0000-0000-00000000a001', 'normative', 'text', 'What do we hold true about our craft that we will not compromise, even under deadline pressure?', null, 'truth-signals.md', 'SIG-1', 1),
  ('00000000-0000-0000-0000-00000000a001', 'normative', 'single_select', 'Who decides what good looks like for a deliverable? Choose the role, not the person.', '["Creative Director","Strategy Lead","Design Lead","Brand Owner","Project Lead"]', 'decision-rights.md', 'SIG-4', 4),
  ('00000000-0000-0000-0000-00000000a001', 'normative', 'single_select', 'When best in the abstract conflicts with best for us now, who makes that call?', '["Creative Director","Strategy Lead","Design Lead","Brand Owner","Project Lead"]', 'decision-rights.md', 'SIG-5', 5),
  ('00000000-0000-0000-0000-00000000a002', 'normative', 'text', 'What can never be changed by a single individual, regardless of seniority or conviction?', null, 'guardrails.md', 'BND-1', 1),
  ('00000000-0000-0000-0000-00000000a002', 'normative', 'single_select', 'Who signs off that a deliverable is done at the craft level?', '["Creative Director","Strategy Lead","Design Lead","Brand Owner","Project Lead"]', 'decision-rights.md', 'BND-4', 4),
  ('00000000-0000-0000-0000-00000000a003', 'normative', 'text', 'What do we checkpoint, and how often? Document where you are, how you got there, and what is unique about this file.', null, 'rollback-rules.md', 'TRC-1', 1),
  ('00000000-0000-0000-0000-00000000a003', 'normative', 'single_select', 'If a page or asset is overwritten or broken, who can execute the path back?', '["Creative Director","Strategy Lead","Design Lead","Brand Owner","Project Lead"]', 'decision-rights.md', 'TRC-2', 2),
  ('00000000-0000-0000-0000-00000000a004', 'normative', 'text', 'How does a truth signal get updated without being overridden by one strong opinion?', null, 'change-protocol.md', 'SPN-1', 1),
  ('00000000-0000-0000-0000-00000000a004', 'normative', 'text', 'When a new member joins mid-effort, how do they fall in line with our structure instead of restarting it?', null, 'change-protocol.md', 'SPN-3', 3),
  ('00000000-0000-0000-0000-00000000a005', 'diagnostic', 'frequency', 'How often do you detach or break a shared component to hit a deadline?', null, null, 'D-FIG-1', 1),
  ('00000000-0000-0000-0000-00000000a005', 'diagnostic', 'binary_with_evidence', 'Were your last three production files audited for detached components?', null, null, 'D-FIG-2', 2),
  ('00000000-0000-0000-0000-00000000a005', 'diagnostic', 'binary_with_evidence', 'Did your last three manuscripts start from the shared template?', null, null, 'D-MAN-1', 3),
  ('00000000-0000-0000-0000-00000000a005', 'diagnostic', 'frequency', 'How often is a working file checkpointed with a note on where you are and how you got there?', null, null, 'D-MAN-2', 4),
  ('00000000-0000-0000-0000-00000000a005', 'diagnostic', 'blind_definition', 'Define what done means for a campaign page. Answer without looking at anyone else.', null, null, 'D-VOC-1', 5);
