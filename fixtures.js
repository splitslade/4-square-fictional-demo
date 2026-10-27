'use strict';
// Hand-authored fictional fixtures, never parsed from company records.
const DEMO_FIXTURES = {
 equipment: {
  name: 'Fictional equipment investigation',
  fields: {
   incident_number: 'SYN-204', branch: 'DEMO',
   incident_title: 'Training cart support bracket damage', incident_date: '2026-10-20',
   summary: 'At a fictional training yard, an empty practice cart tilted during a low-speed positioning exercise when a support bracket loosened. The operator stopped the exercise and isolated the cart. No injury or release occurred.',
   takeaway: 'Inspect support points before moving equipment. Stop and isolate equipment when damage is found.'
  },
  causes: ['The pre-use check did not include the cart support bracket.', 'Repeated practice movements loosened the bracket fasteners.'],
  actions: ['Remove the practice cart from service until the bracket is repaired and checked.', 'Add bracket and fastener checks to the pre-use checklist.', 'Brief training staff on the revised inspection before the next exercise.'],
  photos: ['Practice cart', 'Isolation barrier', 'Bracket check', 'Pre-use checklist']
 },
 walkway: {
  name: 'Fictional walkway near-miss investigation',
  fields: {
   incident_number: 'SYN-318', branch: 'DEMO',
   incident_title: 'Training walkway obstruction near miss', incident_date: '2026-10-22',
   summary: 'At a fictional indoor training area, a participant caught a boot on an empty practice hose crossing a marked walkway. The participant regained balance and reported the near miss. No injury occurred. The session paused while the route was cleared.',
   takeaway: 'Keep pedestrian routes clear. Check walkway conditions whenever a training setup changes.'
  },
  causes: ['A practice hose crossed the marked pedestrian route.', 'The setup check did not verify that walkways remained clear.'],
  actions: ['Reroute the practice hose outside the pedestrian walkway.', 'Include walkway clearance in every training setup check.', 'Discuss the near miss and stop-work expectations at the next training briefing.'],
  photos: ['Marked walkway', 'Temporary barrier', 'Clear route check', 'Setup checklist']
 }
};
