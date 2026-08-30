import { MPTransfer } from 'material-plus-ui';

const PEOPLE = [
  'Ada Lovelace',
  'Alan Turing',
  'Barbara Liskov',
  'Grace Hopper',
  'Katherine Johnson',
  'Margaret Hamilton',
  'Radia Perlman'
].map((name) => ({ value: name, label: name }));

/**
 * `searchable` puts a filter above each list, and each one narrows its own side.
 *
 * A press moves only what the filter is still showing: a row that was ticked and
 * then hidden was never part of that press, which is what keeps a filter from
 * moving things the reader cannot see.
 */
export default function TransferSearchable() {
  return (
    <MPTransfer
      size="sm"
      searchable
      height={160}
      items={PEOPLE}
      defaultValue={['Grace Hopper']}
      sourceLabel="Everyone"
      targetLabel="On the channel"
    />
  );
}
