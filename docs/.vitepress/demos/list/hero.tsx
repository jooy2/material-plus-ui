import { useState } from 'react';
import { ICONS, MPAvatar, MPIcon, MPList, MPListItem, MPSwitch } from 'material-plus-ui';

const PEOPLE = [
  { name: 'Jane Doe', role: 'Design' },
  { name: 'Ada Lovelace', role: 'Engineering' },
  { name: '홍길동', role: 'Research' }
];

export default function ListHero() {
  const [open, setOpen] = useState('Jane Doe');
  const [notify, setNotify] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 20, width: '100%', maxWidth: 420 }}>
      <MPList>
        {PEOPLE.map((person) => (
          <MPListItem
            key={person.name}
            description={person.role}
            selected={open === person.name}
            startIcon={<MPAvatar size="xs" name={person.name} />}
            endIcon={<MPIcon icon={ICONS['chevron-right']} size={18} />}
            onClick={() => setOpen(person.name)}
          >
            {person.name}
          </MPListItem>
        ))}
      </MPList>

      <MPList dividers variant="tonal" size="sm">
        <MPListItem
          description="Every reply, in real time"
          action={<MPSwitch size="xs" checked={notify} onCheckedChange={setNotify} />}
        >
          Notifications
        </MPListItem>
        <MPListItem description="Signed in on 2 devices">Security</MPListItem>
      </MPList>
    </div>
  );
}
