import { MPAvatar, MPFlex, MPHoverCard, MPTextLink, MPTypography } from 'material-plus-ui';

/** The two things a reader wants to know more about without leaving the sentence. */
export default function HoverCardHero() {
  return (
    <MPFlex direction="column" gap={24} style={{ maxWidth: 520 }}>
      <MPTypography>
        The change was reviewed by{' '}
        <MPHoverCard
          trigger={<MPTextLink href="#priya">Priya Raman</MPTextLink>}
          title="Priya Raman"
          description="Platform team"
        >
          <MPFlex gap={12} align="center">
            <MPAvatar name="Priya Raman" />
            <MPTypography level="caption">
              Joined 2023. Owns the deployment pipeline and the release notes nobody reads.
            </MPTypography>
          </MPFlex>
        </MPHoverCard>{' '}
        and merged the same afternoon.
      </MPTypography>

      <MPFlex gap={12} align="center">
        <MPHoverCard
          trigger={<MPAvatar name="Dara Okafor" style={{ cursor: 'pointer' }} />}
          title="Dara Okafor"
          description="Design systems"
          side="right"
          arrow
        >
          Three time zones away and somehow always the first to reply.
        </MPHoverCard>
        <MPTypography level="caption">Hover the avatar</MPTypography>
      </MPFlex>
    </MPFlex>
  );
}
