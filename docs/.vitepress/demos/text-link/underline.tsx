import { MPTextLink } from 'material-plus-ui';

export default function TextLinkUnderline() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <MPTextLink href="#">always — the default</MPTextLink>
      <MPTextLink href="#" underline="hover">
        hover — the line arrives with the pointer
      </MPTextLink>
      <MPTextLink href="#" underline="none" color="primary">
        none — position or colour is saying what it is
      </MPTextLink>
    </div>
  );
}
