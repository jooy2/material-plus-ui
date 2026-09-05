import { useState, type ReactNode } from 'react';
import {
  ICONS,
  MPAccordion,
  MPAccordionItem,
  MPAlert,
  MPAnchor,
  MPAppLogo,
  MPAnimateAppear,
  MPAnimateBlink,
  MPAnimateCounter,
  MPAnimateFade,
  MPAnimateFloat,
  MPAnimateLighting,
  MPAnimateMarquee,
  MPAnimateGrow,
  MPAnimateHeadline,
  MPAnimateReveal,
  MPAnimateRotate,
  MPAnimateScramble,
  MPAnimateShake,
  MPAnimateSlide,
  MPAnimateSplit,
  MPAnimateTyping,
  MPAnimateZoom,
  MPAspectRatio,
  MPAvatar,
  MPBadge,
  MPBlockquote,
  MPBottomNavigation,
  MPBottomNavigationItem,
  MPBox,
  MPBreadcrumb,
  MPBreadcrumbItem,
  MPButton,
  MPButtonGroup,
  MPCard,
  MPCarousel,
  MPChatBubble,
  MPCheckbox,
  MPChip,
  MPCodeBlock,
  MPCollapsible,
  MPColorPicker,
  MPCombobox,
  MPCommandPalette,
  MPContainer,
  MPCalendar,
  MPDataList,
  MPDataTable,
  MPDataListItem,
  MPDatePicker,
  MPDateRangePicker,
  MPDateTimePicker,
  MPDialog,
  MPDialogClose,
  MPDivider,
  MPDrawer,
  MPEmpty,
  MPFieldset,
  MPFilePicker,
  MPFloatingActionButton,
  MPFloatingBottomNavigation,
  MPFooter,
  MPForm,
  MPFlex,
  MPGrid,
  MPGridItem,
  MPHeader,
  MPHighlight,
  MPHoverCard,
  MPIcon,
  MPIconButton,
  MPImage,
  MPList,
  MPListItem,
  MPMenu,
  MPMeter,
  MPMenuItem,
  MPMenuSeparator,
  MPMenubar,
  MPMenubarMenu,
  MPMockup,
  MPNavigationMenu,
  MPNavigationMenuItem,
  MPNavigationMenuLink,
  MPNumberField,
  MPOtpField,
  MPOverlay,
  MPPageLayout,
  MPPagination,
  MPPane,
  MPPanes,
  MPPill,
  MPPopconfirm,
  MPPopover,
  MPProgressBox,
  MPProgressCircular,
  MPProgressLinear,
  MPRadio,
  MPRadioGroup,
  MPRating,
  MPSegmentedButton,
  MPScrollArea,
  MPScrollZone,
  MPSelect,
  MPShortcut,
  MPSidebar,
  MPSkeleton,
  MPSlider,
  MPSnackbarProvider,
  MPSpoiler,
  MPStack,
  MPSwitch,
  MPTab,
  MPTable,
  MPTabPanel,
  MPTabs,
  MPTextField,
  MPTextLink,
  MPTimePicker,
  MPTimeline,
  MPToggle,
  MPToggleGroup,
  MPTimelineItem,
  MPToolbar,
  MPTooltip,
  MPTransfer,
  MPStep,
  MPStepper,
  MPTreeItem,
  MPTreeSelect,
  MPTreeView,
  MPTypography,
  MPVisuallyHidden,
  useMPSnackbar
} from 'material-plus-ui';
import type { MPComboboxValue, MPSelectValue } from 'material-plus-ui';
import { DEFAULT_LOCALE, type Locale } from '../../data/i18n';

/**
 * Every component, with a working one inside each card.
 *
 * The preview is not a picture. It is the component, rendered from `src/`, in
 * whichever scheme the frame's switch is set to — which is the whole reason this
 * page is a demo rather than a table of links.
 *
 * Adding a component means adding an entry here. It is step 10 of the checklist
 * in `docs/{locale}/design/prop-conventions.md`, and the reason it is on the
 * checklist at all is that a component missing from this page is invisible: the
 * index would still list it, but nobody would see what it looks like without
 * clicking through.
 *
 * A preview that needs state needs a component of its own, because a hook cannot
 * live in the array.
 */
type Text = Record<Locale, string>;

interface Entry {
  name: string;
  summary: Text;
  /** Appended to the locale's base path. */
  path: string;
  preview: ReactNode;
}

interface Group {
  title: Text;
  note: Text;
  entries: Entry[];
}

/** Holds a card's preview at the width the card gives it. */
function Fit({ children, width = 260 }: { children: ReactNode; width?: number }) {
  return <div style={{ width: '100%', maxWidth: width }}>{children}</div>;
}

function TextFieldPreview() {
  const [value, setValue] = useState('');

  return (
    <MPTextField
      label="Email"
      type="email"
      placeholder="you@example.com"
      value={value}
      onChange={setValue}
      startIcon={<MPIcon icon={ICONS.search} size={18} />}
      fullWidth
    />
  );
}

function SelectPreview() {
  const [city, setCity] = useState<MPSelectValue | null>('kr-11');

  return (
    <MPSelect
      label="City"
      items={[
        { value: 'kr-11', label: 'Seoul' },
        { value: 'jp-13', label: 'Tokyo' },
        { value: 'fr-75', label: 'Paris' }
      ]}
      value={city}
      onValueChange={setCity}
      fullWidth
    />
  );
}

function NumberFieldPreview() {
  const [quantity, setQuantity] = useState<number | null>(2);

  return (
    <MPNumberField
      label="Quantity"
      value={quantity}
      onValueChange={setQuantity}
      min={0}
      max={99}
      fullWidth
    />
  );
}

function CheckboxPreview() {
  const [checked, setChecked] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <MPCheckbox label="Remember me" checked={checked} onCheckedChange={setChecked} />
      <MPCheckbox label="Some of these" indeterminate />
    </div>
  );
}

function RadioGroupPreview() {
  const [value, setValue] = useState('express');

  return (
    <MPRadioGroup label="Delivery" size="sm" value={value} onValueChange={setValue}>
      <MPRadio value="standard" label="Standard" />
      <MPRadio value="express" label="Express" />
    </MPRadioGroup>
  );
}

function SwitchPreview() {
  const [on, setOn] = useState(true);

  return <MPSwitch label="Wi-Fi" icons checked={on} onCheckedChange={setOn} />;
}

function SliderPreview() {
  const [volume, setVolume] = useState<number | number[]>(45);

  return <MPSlider label="Volume" showValue value={volume} onValueChange={setVolume} />;
}

function RatingPreview() {
  const [score, setScore] = useState(4);

  return <MPRating value={score} onValueChange={setScore} />;
}

function SegmentedButtonPreview() {
  const [view, setView] = useState<string[]>(['list']);

  // Two segments rather than three: a gallery card is narrow, and a segmented
  // button whose labels have truncated is showing the reader the one thing it is
  // not for.
  return (
    <MPSegmentedButton
      aria-label="View"
      size="sm"
      value={view}
      onValueChange={setView}
      items={[
        { value: 'list', label: 'List' },
        { value: 'grid', label: 'Grid' }
      ]}
    />
  );
}

function FilePickerPreview() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <MPFilePicker
      size="xs"
      title="Drop a file"
      hint="or click to browse"
      value={files}
      onFilesChange={setFiles}
    />
  );
}

function ChipPreview() {
  const [on, setOn] = useState(true);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
      <MPChip size="sm" selected={on} onClick={() => setOn((value) => !value)}>
        Open
      </MPChip>
      <MPChip size="sm" variant="tonal" onDelete={() => {}}>
        design
      </MPChip>
    </div>
  );
}

function ListPreview() {
  return (
    <MPList size="xs" variant="text" dividers>
      <MPListItem description="Design" selected>
        Jane Doe
      </MPListItem>
      <MPListItem description="Engineering">Ada Lovelace</MPListItem>
    </MPList>
  );
}

function TablePreview() {
  return (
    <MPTable
      size="xs"
      variant="text"
      striped
      headers={[
        { key: 'branch', label: 'Branch' },
        { key: 'time', label: 'Time', align: 'end' }
      ]}
      items={[
        { branch: 'main', time: '184s' },
        { branch: 'feat/chip', time: '41s' }
      ]}
    />
  );
}

function ComboboxPreview() {
  const [value, setValue] = useState<MPComboboxValue | null>('rs');

  return (
    <MPCombobox
      label="Language"
      items={[
        { value: 'ts', label: 'TypeScript' },
        { value: 'rs', label: 'Rust' },
        { value: 'go', label: 'Go' }
      ]}
      value={value}
      onValueChange={setValue}
      fullWidth
    />
  );
}

function MenuPreview() {
  return (
    <MPMenu
      size="sm"
      trigger={
        <MPButton size="sm" variant="outlined">
          Actions
        </MPButton>
      }
    >
      <MPMenuItem shortcut="⌘C">Copy</MPMenuItem>
      <MPMenuItem>Duplicate</MPMenuItem>
      <MPMenuSeparator />
      <MPMenuItem color="error">Delete</MPMenuItem>
    </MPMenu>
  );
}

function ColorPickerPreview() {
  const [color, setColor] = useState('#00639b');

  return (
    <MPColorPicker
      label="Tag"
      size="sm"
      value={color}
      onValueChange={setColor}
      swatches={false}
      editable={false}
      fullWidth
    />
  );
}

function OverlayPreview() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <MPButton
        size="sm"
        variant="outlined"
        onClick={() => {
          setOpen(true);
          window.setTimeout(() => setOpen(false), 1400);
        }}
      >
        Show a scrim
      </MPButton>
      <MPOverlay open={open} label="Working" onOpenChange={setOpen}>
        <MPProgressCircular size="lg" />
      </MPOverlay>
    </>
  );
}

function SnackbarPreview() {
  const snackbar = useMPSnackbar();

  return (
    <MPButton size="sm" variant="outlined" onClick={() => snackbar.add({ message: 'Draft saved' })}>
      Raise one
    </MPButton>
  );
}

/**
 * The pickers, each holding a value so the card shows a formatted date rather
 * than a placeholder. Every one of them needs state, and a hook cannot live in
 * the array below.
 */
function CalendarPreview() {
  const [value, setValue] = useState<Date | null>(new Date());

  return <MPCalendar size="xs" value={value} onValueChange={setValue} />;
}

function DatePickerPreview() {
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <MPDatePicker label="Due date" size="sm" value={value} onValueChange={setValue} fullWidth />
  );
}

function DateRangePickerPreview() {
  const start = new Date();
  const end = new Date();

  end.setDate(end.getDate() + 6);

  const [value, setValue] = useState({ start, end } as { start: Date | null; end: Date | null });

  return (
    <MPDateRangePicker label="Stay" size="sm" value={value} onValueChange={setValue} fullWidth />
  );
}

function DateTimePickerPreview() {
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <MPDateTimePicker label="Starts" size="sm" value={value} onValueChange={setValue} fullWidth />
  );
}

function TimePickerPreview() {
  const [value, setValue] = useState<Date | null>(new Date());

  return (
    <MPTimePicker label="Starts at" size="sm" value={value} onValueChange={setValue} fullWidth />
  );
}

/** A split small enough to fit a card, with a handle that really drags. */
function PanesPreview() {
  return (
    <div
      className="border-mp-outline-variant rounded-mp-xs overflow-hidden border"
      style={{ height: 96, width: '100%' }}
    >
      <MPPanes size="sm">
        <MPPane defaultSize="40%" minSize="20%">
          <div className="text-mp-on-surface-variant text-mp-body-small p-3">Sidebar</div>
        </MPPane>
        <MPPane minSize="20%">
          <div className="text-mp-on-surface-variant text-mp-body-small p-3">Body</div>
        </MPPane>
      </MPPanes>
    </div>
  );
}

function PageLayoutPreview() {
  return (
    <div
      className="border-mp-outline-variant rounded-mp-xs overflow-hidden border"
      style={{ height: 120, width: '100%' }}
    >
      <MPPageLayout
        height="auto"
        scroll="content"
        skipLink={false}
        header={
          <header className="bg-mp-surface-container text-mp-on-surface text-mp-label-large flex h-8 shrink-0 items-center px-3">
            Header
          </header>
        }
        sidebar={
          <aside className="bg-mp-surface-container-low text-mp-on-surface-variant border-mp-outline-variant text-mp-body-small w-20 shrink-0 border-e px-3 py-2">
            Nav
          </aside>
        }
        footer={
          <footer className="border-mp-outline-variant text-mp-on-surface-variant text-mp-body-small flex h-7 shrink-0 items-center border-t px-3">
            Footer
          </footer>
        }
      >
        <div className="text-mp-on-surface-variant text-mp-body-small p-3">Main</div>
      </MPPageLayout>
    </div>
  );
}

function SidebarPreview() {
  return (
    <div
      className="border-mp-outline-variant rounded-mp-xs overflow-hidden border"
      style={{ height: 120, width: '100%' }}
    >
      <MPPageLayout
        height="auto"
        scroll="content"
        skipLink={false}
        collapseBelow="none"
        sidebar={
          <MPSidebar size="sm" width={110} label="Sections" sticky={false}>
            <MPList variant="text" size="sm">
              <MPListItem selected onClick={() => {}}>
                Overview
              </MPListItem>
              <MPListItem onClick={() => {}}>Reports</MPListItem>
            </MPList>
          </MPSidebar>
        }
      >
        <div className="text-mp-on-surface-variant text-mp-body-small p-3">Overview</div>
      </MPPageLayout>
    </div>
  );
}

function TogglePreview() {
  const [marks, setMarks] = useState<string[]>(['bold']);

  return (
    <MPToggleGroup size="sm" multiple value={marks} onValueChange={setMarks}>
      <MPToggle value="bold">Bold</MPToggle>
      <MPToggle value="italic">Italic</MPToggle>
    </MPToggleGroup>
  );
}

function TransferPreview() {
  const [chosen, setChosen] = useState<string[]>(['email']);

  return (
    <MPTransfer
      size="xs"
      height={96}
      items={[
        { value: 'name', label: 'Name' },
        { value: 'email', label: 'Email' },
        { value: 'role', label: 'Role' }
      ]}
      value={chosen}
      onValueChange={setChosen}
    />
  );
}

function FormPreview() {
  const [email, setEmail] = useState('');

  return (
    <MPForm size="sm" onSubmit={() => {}}>
      <MPTextField
        name="email"
        type="email"
        label="Email"
        required
        size="sm"
        value={email}
        onChange={setEmail}
        fullWidth
      />
      <MPButton type="submit" size="sm" fullWidth>
        Save
      </MPButton>
    </MPForm>
  );
}

function FieldsetPreview() {
  const [street, setStreet] = useState('');

  return (
    <MPFieldset legend="Billing address" size="sm">
      <MPTextField
        name="street"
        label="Street"
        size="sm"
        value={street}
        onChange={setStreet}
        fullWidth
      />
      <MPCheckbox size="sm" label="Business address" />
    </MPFieldset>
  );
}

function CommandPalettePreview() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <MPButton variant="outlined" size="sm" onClick={() => setOpen(true)}>
        <MPShortcut size="xs" keys="Mod+K" />
      </MPButton>
      <MPCommandPalette
        items={[
          { value: 'new', label: 'New document', group: 'File', shortcut: 'Mod+N' },
          { value: 'open', label: 'Open…', group: 'File' },
          { value: 'copy', label: 'Copy link', group: 'Share' }
        ]}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

const GROUPS: Group[] = [
  {
    title: { ko: '입력', en: 'Inputs' },
    note: {
      ko: '사람이 눌러서 무언가를 일으키거나, 값을 받아내는 컨트롤.',
      en: 'Controls a reader acts on — to make something happen, or to hand over a value.'
    },
    entries: [
      {
        name: 'MPButton',
        summary: {
          ko: '머터리얼의 다섯 가지 버튼',
          en: "Material's five buttons"
        },
        path: '/components/inputs/button',
        preview: (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            <MPButton size="sm">Save</MPButton>
            <MPButton size="sm" variant="tonal">
              Preview
            </MPButton>
            <MPButton size="sm" variant="outlined">
              Cancel
            </MPButton>
          </div>
        )
      },
      {
        name: 'MPButtonGroup',
        summary: {
          ko: '함께 묶이는 버튼들, 설정은 한 번만',
          en: 'Buttons that belong together, configured once'
        },
        path: '/components/inputs/button-group',
        preview: (
          <MPButtonGroup variant="outlined" size="sm">
            <MPButton>Copy</MPButton>
            <MPButton>Share</MPButton>
            <MPButton>Delete</MPButton>
          </MPButtonGroup>
        )
      },
      {
        name: 'MPFloatingActionButton',
        summary: {
          ko: '화면이 다루는 단 하나의 액션이, 그 위에 떠 있는 것',
          en: 'The one action a screen is about, floating over it'
        },
        path: '/components/inputs/floating-action-button',
        preview: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MPFloatingActionButton
              position="static"
              icon={<MPIcon icon={ICONS.add} />}
              label="Compose"
            />
            <MPFloatingActionButton
              position="static"
              extended
              icon={<MPIcon icon={ICONS.add} />}
              label="Compose"
            />
          </div>
        )
      },
      {
        name: 'MPIconButton',
        summary: {
          ko: '글리프 하나뿐인 둥근 버튼. 이름은 필수입니다',
          en: 'A disc with a glyph in it — and a name, required'
        },
        path: '/components/inputs/icon-button',
        preview: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MPIconButton size="sm" icon={<MPIcon icon={ICONS.search} />} label="Search" />
            <MPIconButton
              size="sm"
              variant="tonal"
              icon={<MPIcon icon={ICONS.copy} />}
              label="Copy"
            />
            <MPIconButton
              size="sm"
              variant="filled"
              icon={<MPIcon icon={ICONS.add} />}
              label="Add"
            />
            <MPIconButton
              size="sm"
              variant="outlined"
              icon={<MPIcon icon={ICONS.more} />}
              label="More"
            />
          </div>
        )
      },
      {
        name: 'MPRating',
        summary: {
          ko: '별 다섯 개로 표현하는 점수',
          en: 'A score out of five, as a row of stars'
        },
        path: '/components/inputs/rating',
        preview: <RatingPreview />
      },
      {
        name: 'MPMenubar',
        summary: {
          ko: '각각이 메뉴를 여는, 말들의 띠',
          en: 'A strip of words, each of which opens a menu'
        },
        path: '/components/inputs/menubar',
        preview: (
          <Fit>
            <MPMenubar size="sm">
              <MPMenubarMenu label="File">
                <MPMenuItem shortcut="Mod+N" onClick={() => {}}>
                  New
                </MPMenuItem>
                <MPMenuSeparator />
                <MPMenuItem onClick={() => {}}>Open…</MPMenuItem>
              </MPMenubarMenu>
              <MPMenubarMenu label="Edit">
                <MPMenuItem onClick={() => {}}>Undo</MPMenuItem>
              </MPMenubarMenu>
            </MPMenubar>
          </Fit>
        )
      },
      {
        name: 'MPCommandPalette',
        summary: {
          ko: '애플리케이션이 할 수 있는 모든 것을 필드 하나 뒤에',
          en: 'Everything an application can do, behind one field'
        },
        path: '/components/inputs/command-palette',
        preview: (
          <Fit>
            <CommandPalettePreview />
          </Fit>
        )
      },
      {
        name: 'MPFieldset',
        summary: {
          ko: '하나의 질문에 함께 답하는 컨트롤 묶음',
          en: 'A group of controls that answer one question together'
        },
        path: '/components/inputs/fieldset',
        preview: (
          <Fit>
            <FieldsetPreview />
          </Fit>
        )
      },
      {
        name: 'MPForm',
        summary: {
          ko: '어느 필드가 틀렸는지 아는 `<form>`',
          en: 'A `<form>` that knows which of its fields is wrong'
        },
        path: '/components/inputs/form',
        preview: (
          <Fit>
            <FormPreview />
          </Fit>
        )
      },
      {
        name: 'MPTransfer',
        summary: {
          ko: '두 목록과 그 사이의 화살표 — 긴 선택을 위한 모양',
          en: 'Two lists and the arrows between them, for a long choice'
        },
        path: '/components/inputs/transfer',
        preview: (
          <Fit width={300}>
            <TransferPreview />
          </Fit>
        )
      },
      {
        name: 'MPToggle',
        summary: {
          ko: '눌린 채로 남는 버튼 — 꺼짐은 중립, 켜짐은 강조색',
          en: 'A button that stays down: neutral off, accent on'
        },
        path: '/components/inputs/toggle',
        preview: (
          <Fit>
            <TogglePreview />
          </Fit>
        )
      },
      {
        name: 'MPSegmentedButton',
        summary: {
          ko: '하나의 알약 안에 담긴 두세 가지 선택',
          en: 'Two to five choices in one pill'
        },
        path: '/components/inputs/segmented-button',
        preview: <SegmentedButtonPreview />
      },
      {
        name: 'MPCalendar',
        summary: {
          ko: '팝업이 아니라 페이지 위의 한 달',
          en: 'A month on the page, rather than in a popup'
        },
        path: '/components/inputs/calendar',
        preview: (
          <Fit>
            <CalendarPreview />
          </Fit>
        )
      },
      {
        name: 'MPDatePicker',
        summary: {
          ko: '달력에서 고르는 하루. 어느 해든 세 번의 클릭',
          en: 'One day from a calendar — any year at all is three clicks'
        },
        path: '/components/inputs/date-picker',
        preview: (
          <Fit>
            <DatePickerPreview />
          </Fit>
        )
      },
      {
        name: 'MPDateRangePicker',
        summary: {
          ko: '나란한 두 달에서 고르는 구간',
          en: 'A span, across two months side by side'
        },
        path: '/components/inputs/date-range-picker',
        preview: (
          <Fit>
            <DateRangePickerPreview />
          </Fit>
        )
      },
      {
        name: 'MPTimePicker',
        summary: {
          ko: '다이얼이 아니라 열에서 고르는 시각',
          en: 'A time of day, from columns rather than a dial'
        },
        path: '/components/inputs/time-picker',
        preview: (
          <Fit>
            <TimePickerPreview />
          </Fit>
        )
      },
      {
        name: 'MPDateTimePicker',
        summary: {
          ko: '한 팝업 안의 날짜와 시각',
          en: 'A day and a time, in one popup'
        },
        path: '/components/inputs/date-time-picker',
        preview: (
          <Fit>
            <DateTimePickerPreview />
          </Fit>
        )
      },
      {
        name: 'MPTextField',
        summary: {
          ko: 'IME를 견디는 outlined 텍스트 필드',
          en: 'An outlined text field that survives an IME'
        },
        path: '/components/inputs/text-field',
        preview: (
          <Fit>
            <TextFieldPreview />
          </Fit>
        )
      },
      {
        name: 'MPSelect',
        summary: {
          ko: '텍스트 필드의 껍데기를 쓴 드롭다운',
          en: "A dropdown wearing the text field's shell"
        },
        path: '/components/inputs/select',
        preview: (
          <Fit>
            <SelectPreview />
          </Fit>
        )
      },
      {
        name: 'MPNumberField',
        summary: {
          ko: '숫자만 담는 필드. 서식과 범위 제한까지',
          en: 'A field that only holds a number, formatting and all'
        },
        path: '/components/inputs/number-field',
        preview: (
          <Fit>
            <NumberFieldPreview />
          </Fit>
        )
      },
      {
        name: 'MPCheckbox',
        summary: {
          ko: '예/아니오 하나, 또는 그 묶음 중 하나',
          en: 'A single yes or no, or one of a set'
        },
        path: '/components/inputs/checkbox',
        preview: <CheckboxPreview />
      },
      {
        name: 'MPRadioGroup',
        summary: {
          ko: '정확히 하나만 고르는 선택지 묶음',
          en: 'A set of options where exactly one is chosen'
        },
        path: '/components/inputs/radio-group',
        preview: <RadioGroupPreview />
      },
      {
        name: 'MPSwitch',
        summary: {
          ko: '누르는 즉시 적용되는 켜짐/꺼짐',
          en: 'An on and off that takes effect immediately'
        },
        path: '/components/inputs/switch',
        preview: <SwitchPreview />
      },
      {
        name: 'MPSlider',
        summary: {
          ko: '범위 위에서 고르는 값',
          en: 'A value chosen along a range'
        },
        path: '/components/inputs/slider',
        preview: (
          <Fit>
            <SliderPreview />
          </Fit>
        )
      },
      {
        name: 'MPFilePicker',
        summary: {
          ko: '파일을 떨어뜨리거나 눌러서 고르는 상자',
          en: 'A box you drop files on, or click to browse'
        },
        path: '/components/inputs/file-picker',
        preview: (
          <Fit width={280}>
            <FilePickerPreview />
          </Fit>
        )
      },
      {
        name: 'MPCombobox',
        summary: {
          ko: '입력해서 걸러내고, 없으면 만들어 넣는 필드',
          en: 'A field you type into, filter with, and can add to'
        },
        path: '/components/inputs/combobox',
        preview: (
          <Fit>
            <ComboboxPreview />
          </Fit>
        )
      },
      {
        name: 'MPMenu',
        summary: {
          ko: '누르면 나타나는 동작의 목록',
          en: 'A list of actions that appears when something is pressed'
        },
        path: '/components/inputs/menu',
        preview: <MenuPreview />
      },
      {
        name: 'MPOtpField',
        summary: {
          ko: '한 글자씩 들어가는 인증 코드 줄',
          en: 'A row of one-character slots for a code'
        },
        path: '/components/inputs/otp-field',
        preview: <MPOtpField length={4} defaultValue="42" size="sm" />
      },
      {
        name: 'MPColorPicker',
        summary: {
          ko: '눈으로 고르는 색. 채도 사각형과 색조 레일',
          en: 'A colour chosen by eye, with a square and a hue rail'
        },
        path: '/components/inputs/color-picker',
        preview: (
          <Fit width={200}>
            <ColorPickerPreview />
          </Fit>
        )
      },
      {
        name: 'MPTreeSelect',
        summary: {
          ko: '목록이 아니라 나무에서 고르는 값',
          en: 'A value chosen from a tree rather than from a list'
        },
        path: '/components/inputs/tree-select',
        preview: (
          <Fit width={220}>
            <MPTreeSelect
              size="sm"
              fullWidth
              label="Region"
              defaultValue="seoul"
              items={[
                {
                  value: 'asia',
                  label: 'Asia',
                  children: [
                    { value: 'seoul', label: 'Seoul' },
                    { value: 'tokyo', label: 'Tokyo' }
                  ]
                },
                { value: 'europe', label: 'Europe', children: [{ value: 'paris', label: 'Paris' }] }
              ]}
            />
          </Fit>
        )
      }
    ]
  },
  {
    title: { ko: '표시', en: 'Display' },
    note: {
      ko: '무언가를 보여주고, 그 이상은 하지 않는 것.',
      en: 'It shows something, and nothing more.'
    },
    entries: [
      {
        name: 'MPChatBubble',
        summary: {
          ko: '대화 속 메시지 하나',
          en: 'One message in a conversation'
        },
        path: '/components/display/chat-bubble',
        preview: (
          <Fit>
            <div style={{ display: 'grid', gap: 8 }}>
              <MPChatBubble size="sm" time="18:01">
                Still on for six?
              </MPChatBubble>
              <MPChatBubble size="sm" side="end" variant="filled" status="read">
                Booked it.
              </MPChatBubble>
            </div>
          </Fit>
        )
      },
      {
        name: 'MPPill',
        summary: {
          ko: '살아 있는 정보를 담아 떠 있는 알약',
          en: 'A floating lozenge holding live information'
        },
        path: '/components/display/pill',
        preview: (
          <MPPill
            size="sm"
            title="On a call"
            description="04:12"
            startIcon={<MPIcon icon={ICONS.clock} />}
          />
        )
      },
      {
        name: 'MPSpoiler',
        summary: {
          ko: '요청하기 전까지 가려 두는 내용',
          en: 'Content that is covered until somebody asks for it'
        },
        path: '/components/display/spoiler',
        preview: (
          <Fit>
            <MPSpoiler size="sm" reversible>
              She was his sister the whole time.
            </MPSpoiler>
          </Fit>
        )
      },
      {
        name: 'MPIcon',
        summary: {
          ko: '아는 크기와 아는 색의 글리프',
          en: 'A glyph at a known size, in a known colour'
        },
        path: '/components/display/icon',
        preview: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <MPIcon icon={ICONS.search} size={22} color="var(--color-mp-primary)" label="Search" />
            <MPIcon icon={ICONS.info} size={26} color="var(--color-mp-on-surface)" label="Info" />
            <MPIcon icon={ICONS.error} size={30} color="var(--color-mp-error)" label="Failed" />
          </div>
        )
      },
      {
        name: 'MPVisuallyHidden',
        summary: {
          ko: '화면 낭독기만 읽는 문장. 자리는 차지하지 않습니다',
          en: 'A sentence only a screen reader gets, taking up no room'
        },
        path: '/components/display/visually-hidden',
        preview: (
          <button
            type="button"
            style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
          >
            <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>
              ×
            </span>
            <MPVisuallyHidden>Close this dialog</MPVisuallyHidden>
          </button>
        )
      },
      {
        name: 'MPTypography',
        summary: {
          ko: '머터리얼의 타입 역할로 조판된 글',
          en: "Text at one of Material's type roles"
        },
        path: '/components/display/typography',
        preview: (
          <Fit>
            <MPTypography level="h4">Headline</MPTypography>
            <MPTypography level="caption">body-small, on-surface-variant</MPTypography>
          </Fit>
        )
      },
      {
        name: 'MPDivider',
        summary: { ko: '두 가지 사이를 가르는 선', en: 'A rule between two things' },
        path: '/components/display/divider',
        preview: (
          <Fit width={200}>
            <MPDivider size="sm">OR</MPDivider>
          </Fit>
        )
      },
      {
        name: 'MPAvatar',
        summary: {
          ko: '절대 빈 상자가 되지 않는 사진',
          en: 'A picture that is never an empty box'
        },
        path: '/components/display/avatar',
        preview: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MPAvatar size="sm" name="Jane Doe" />
            <MPAvatar size="sm" name="홍길동" color="tertiary" />
            <MPAvatar size="sm" variant="outlined" />
          </div>
        )
      },
      {
        name: 'MPBadge',
        summary: {
          ko: '다른 것의 모서리에 붙는 작은 표시',
          en: 'A small mark in the corner of something else'
        },
        path: '/components/display/badge',
        preview: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <MPBadge content={3} label="3 unread" overlap="circle">
              <MPAvatar size="sm" name="Jane Doe" />
            </MPBadge>
            <MPBadge content={128} label="128 notifications">
              <MPButton size="sm" variant="tonal">
                Inbox
              </MPButton>
            </MPBadge>
          </div>
        )
      },
      {
        name: 'MPChip',
        summary: {
          ko: '태그, 필터, 상태를 담는 작은 토큰',
          en: 'A compact token: a tag, a filter, a status'
        },
        path: '/components/display/chip',
        preview: <ChipPreview />
      },
      {
        name: 'MPList',
        summary: {
          ko: '행을 쌓은 것. 설정은 묶음에 한 번만',
          en: 'A stack of rows, configured once'
        },
        path: '/components/display/list',
        preview: (
          <Fit>
            <ListPreview />
          </Fit>
        )
      },
      {
        name: 'MPTable',
        summary: {
          ko: '열로 서술하는 데이터 격자',
          en: 'A grid of data, described by its columns'
        },
        path: '/components/display/table',
        preview: (
          <Fit>
            <TablePreview />
          </Fit>
        )
      },
      {
        name: 'MPImage',
        summary: {
          ko: '오는 중일 때도, 오지 않을 때도 말하는 그림',
          en: 'A picture that says what it is doing, arriving or not'
        },
        path: '/components/display/image',
        preview: (
          <div style={{ width: 132 }}>
            <MPImage
              src="/mp-gallery-nothing-here.png"
              alt="A photo that never arrived"
              ratio="16 / 9"
            />
          </div>
        )
      },
      {
        name: 'MPStepper',
        summary: {
          ko: '한 번에 한 패널로 밟아 나가는 순서',
          en: 'A sequence being worked through, one panel at a time'
        },
        path: '/components/display/stepper',
        preview: (
          <MPStepper active={1} size="xs">
            <MPStep label="Account" />
            <MPStep label="Payment" />
            <MPStep label="Done" />
          </MPStepper>
        )
      },
      {
        name: 'MPTimeline',
        summary: { ko: '벌어진 순서대로 놓인 단계들', en: 'Steps, in the order they happen in' },
        path: '/components/display/timeline',
        preview: (
          <Fit width={200}>
            <MPTimeline size="xs" active={1}>
              <MPTimelineItem title="Ordered" bullet="1" />
              <MPTimelineItem title="Packed" bullet="2" />
              <MPTimelineItem title="Delivered" bullet="3" />
            </MPTimeline>
          </Fit>
        )
      },
      {
        name: 'MPBlockquote',
        summary: {
          ko: '내 글과 구분해 놓은 남의 말',
          en: "Somebody else's words, set apart from yours"
        },
        path: '/components/display/blockquote',
        preview: (
          <Fit>
            <MPBlockquote size="xs" icon={false} author="Ada Lovelace">
              The Analytical Engine has no pretensions whatever.
            </MPBlockquote>
          </Fit>
        )
      },
      {
        name: 'MPShortcut',
        summary: {
          ko: '플랫폼에 맞게 이름이 붙는 키보드 키',
          en: 'A keyboard key, named for the platform'
        },
        path: '/components/display/shortcut',
        preview: (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <MPShortcut keys="Mod+K" size="sm" />
            <MPShortcut keys="Shift+Enter" size="sm" />
          </div>
        )
      },
      {
        name: 'MPTextLink',
        summary: { ko: '문장 안에 있거나 홀로 선 링크', en: 'A link, in a sentence or on its own' },
        path: '/components/display/text-link',
        preview: (
          <Fit>
            <span style={{ lineHeight: 1.8 }}>
              The roles are on <MPTextLink href="#">the colour page</MPTextLink>, and the spec is at{' '}
              <MPTextLink href="https://m3.material.io" newTab>
                m3.material.io
              </MPTextLink>
              .
            </span>
          </Fit>
        )
      },
      {
        name: 'MPBreadcrumb',
        summary: { ko: '지금 페이지 위쪽의 경로', en: 'The trail of pages above this one' },
        path: '/components/display/breadcrumb',
        preview: (
          <MPBreadcrumb size="sm">
            <MPBreadcrumbItem href="#">Home</MPBreadcrumbItem>
            <MPBreadcrumbItem href="#">Docs</MPBreadcrumbItem>
            <MPBreadcrumbItem>Breadcrumb</MPBreadcrumbItem>
          </MPBreadcrumb>
        )
      },
      {
        name: 'MPAppLogo',
        summary: {
          ko: '정해진 크기의 제품 마크. 결코 빈 상자가 되지 않습니다',
          en: 'A product’s mark at a known size, which is never an empty box'
        },
        path: '/components/display/app-logo',
        preview: (
          <MPFlex gap={12} align="center">
            <MPAppLogo name="Voltage" shape="app" size="sm" />
            <MPAppLogo name="Voltage" shape="circle" variant="tonal" color="tertiary" size="sm" />
            <MPAppLogo name="Voltage" size="sm" />
          </MPFlex>
        )
      },
      {
        name: 'MPTreeView',
        summary: {
          ko: '열리고 닫히는 행들의 나무. 탭 스톱 하나, 화살표 키로 이동',
          en: 'A tree of rows that open and shut — one tab stop, walked with the arrow keys'
        },
        path: '/components/display/tree-view',
        preview: (
          <Fit>
            <MPTreeView
              size="xs"
              variant="text"
              lines="folder"
              label="Files"
              defaultExpanded={['src']}
              defaultSelected={['index']}
            >
              <MPTreeItem value="src" label="src">
                <MPTreeItem value="index" label="index.ts" />
                <MPTreeItem value="types" label="types.ts" />
              </MPTreeItem>
              <MPTreeItem value="readme" label="README.md" />
            </MPTreeView>
          </Fit>
        )
      },
      {
        name: 'MPDataTable',
        summary: {
          ko: '정렬하고 검색하고 넘겨 보고 골라 가는 표',
          en: 'A table you can sort, search, step through and take rows out of'
        },
        path: '/components/display/data-table',
        preview: (
          <Fit width={300}>
            <MPDataTable
              size="xs"
              sortable
              striped
              defaultSort={[{ key: 'score', direction: 'desc' }]}
              getRowKey={(row: { id: string; name: string; score: number }) => row.id}
              headers={[
                { key: 'name', label: 'Name' },
                { key: 'score', label: 'Score', align: 'end' }
              ]}
              items={[
                { id: 'a', name: 'Ada', score: 30 },
                { id: 'b', name: 'Bo', score: 10 },
                { id: 'c', name: 'Cai', score: 20 }
              ]}
            />
          </Fit>
        )
      },
      {
        name: 'MPCodeBlock',
        summary: {
          ko: '코드 한 줄이든 천 줄이든 보여 주는 뷰어',
          en: 'A viewer for one line of code or a thousand'
        },
        path: '/components/display/code-block',
        preview: (
          <Fit>
            <MPCodeBlock
              size="xs"
              language="ts"
              copyable={false}
              code={'const answer = 42;\nexport { answer };'}
              style={{ width: '100%' }}
            />
          </Fit>
        )
      },
      {
        name: 'MPDataList',
        summary: {
          ko: '무엇들과 그것들의 이름. 상세 패널이 취하는 모양',
          en: 'A list of things and what they are called — the shape a details panel takes'
        },
        path: '/components/display/data-list',
        preview: (
          <Fit>
            <MPDataList size="sm" density={-1} style={{ width: '100%' }}>
              <MPDataListItem label="Status">Active</MPDataListItem>
              <MPDataListItem label="Owner">Priya Raman</MPDataListItem>
              <MPDataListItem label="Deployed">4 Mar 2026</MPDataListItem>
            </MPDataList>
          </Fit>
        )
      },
      {
        name: 'MPAnchor',
        summary: {
          ko: '읽고 있는 페이지의 제목 목록, 독자가 있는 항목이 표시된 채로',
          en: 'The headings of the page being read, with the one the reader is in marked'
        },
        path: '/components/display/anchor',
        preview: (
          <MPAnchor
            size="xs"
            activeHref="#usage"
            items={[
              { href: '#install', label: 'Install' },
              { href: '#usage', label: 'Usage' },
              { href: '#options', label: 'Options', depth: 1 }
            ]}
          />
        )
      },
      {
        name: 'MPPagination',
        summary: {
          ko: '페이지들의 행, 그중 하나가 지금 읽는 페이지',
          en: 'A row of pages, one of which is the one being read'
        },
        path: '/components/display/pagination',
        preview: <MPPagination count={12} defaultPage={3} size="xs" />
      },
      {
        name: 'MPHighlight',
        summary: {
          ko: '읽던 글 안에서 찾는 단어를 표시',
          en: 'Marks the words a reader is looking for'
        },
        path: '/components/display/highlight',
        preview: (
          <Fit>
            <MPHighlight query={['data', 'query']}>
              A data set that nobody can query is a file.
            </MPHighlight>
          </Fit>
        )
      }
    ]
  },
  {
    title: { ko: '피드백', en: 'Feedback' },
    note: {
      ko: '무슨 일이 일어났는지, 또는 무엇이 일어나고 있는지 말하는 것.',
      en: 'It says what happened, or what is happening.'
    },
    entries: [
      {
        name: 'MPAlert',
        summary: {
          ko: '페이지 안에 놓이는, 방금 일어난 일에 대한 메시지',
          en: 'A message about something that happened, set into the page'
        },
        path: '/components/feedback/alert',
        preview: (
          <Fit>
            <MPAlert size="sm" color="error" title="Payment failed" onClose={() => {}}>
              The bank declined the card.
            </MPAlert>
          </Fit>
        )
      },
      {
        name: 'MPSkeleton',
        summary: {
          ko: '아직 도착하지 않은 것의 모양',
          en: 'The shape of something not loaded yet'
        },
        path: '/components/feedback/skeleton',
        preview: (
          <Fit>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MPSkeleton shape="circle" size="sm" />
              <div style={{ display: 'grid', gap: 6, flex: 1 }}>
                <MPSkeleton size="sm" width="70%" />
                <MPSkeleton size="xs" width="45%" />
              </div>
            </div>
          </Fit>
        )
      },
      {
        name: 'MPEmpty',
        summary: {
          ko: '내용이 있었어야 할 자리에 서는 것',
          en: 'What stands where content would have been'
        },
        path: '/components/feedback/empty',
        preview: (
          <Fit>
            <MPEmpty size="xs" title="No results">
              Try a shorter term.
            </MPEmpty>
          </Fit>
        )
      },
      {
        name: 'MPTooltip',
        summary: {
          ko: '포인터가 머물면 나타나는 짧은 라벨',
          en: 'A short label, when the pointer rests'
        },
        path: '/components/feedback/tooltip',
        preview: (
          <MPTooltip content="Copy to clipboard" defaultOpen={false}>
            <MPButton size="sm" variant="tonal">
              Hover me
            </MPButton>
          </MPTooltip>
        )
      },
      {
        name: 'MPPopconfirm',
        summary: {
          ko: '컨트롤이 있는 자리에 머무는 확인',
          en: 'A confirmation that stays where the control is'
        },
        path: '/components/feedback/popconfirm',
        preview: (
          <MPPopconfirm
            trigger={
              <MPButton size="sm" color="error" variant="outlined">
                Delete
              </MPButton>
            }
            title="Delete this row?"
            confirmLabel="Delete"
            color="error"
          />
        )
      },
      {
        name: 'MPPopover',
        summary: {
          ko: '자기를 연 것 옆에 열리는, 손이 닿는 시트',
          en: 'A sheet that opens beside the thing that opened it'
        },
        path: '/components/feedback/popover',
        preview: (
          <MPPopover
            size="sm"
            title="Rename this view"
            description="Only you will see it"
            trigger={
              <MPButton size="sm" variant="tonal">
                Open a popover
              </MPButton>
            }
          >
            Unlike a tooltip, this one can be entered with the keyboard.
          </MPPopover>
        )
      },
      {
        name: 'MPDialog',
        summary: {
          ko: '답할 때까지 페이지를 가져가는 시트',
          en: 'A sheet that takes the page away until it is answered'
        },
        path: '/components/feedback/dialog',
        preview: (
          <MPDialog
            trigger={
              <MPButton size="sm" variant="tonal">
                Open a dialog
              </MPButton>
            }
            title="Delete “Aurora”?"
            description="Everything in it goes too."
            size="sm"
            actions={
              <MPDialogClose
                render={
                  <MPButton size="sm" variant="text">
                    Cancel
                  </MPButton>
                }
              />
            }
          />
        )
      },
      {
        name: 'MPOverlay',
        summary: {
          ko: '페이지를 덮어 쓰지 못하게 하는 스크림',
          en: 'A scrim over the page that stops it being used'
        },
        path: '/components/feedback/overlay',
        preview: <OverlayPreview />
      },
      {
        name: 'MPSnackbar',
        summary: {
          ko: '이미 일어난 일에 대한 짧은 메시지',
          en: 'A short message about something that has happened'
        },
        path: '/components/feedback/snackbar',
        preview: (
          <MPSnackbarProvider timeout={2500}>
            <SnackbarPreview />
          </MPSnackbarProvider>
        )
      },
      {
        name: 'MPProgressLinear',
        summary: {
          ko: '채워지는 바. 얼마나 남았는지를 한눈에',
          en: 'A bar that fills — how much is left, at a glance'
        },
        path: '/components/feedback/progress-linear',
        preview: (
          <Fit>
            <MPProgressLinear value={62} showValue label="Uploading" />
          </Fit>
        )
      },
      {
        name: 'MPHoverCard',
        summary: {
          ko: '포인터가 머물면 열리는 카드. 그 너머의 미리 보기',
          en: 'A card that opens on a rest, holding a preview of what is on the other side'
        },
        path: '/components/feedback/hover-card',
        preview: (
          <Fit>
            <MPHoverCard
              size="sm"
              trigger={<MPTextLink href="#priya">Priya Raman</MPTextLink>}
              title="Priya Raman"
              description="Platform team"
            />
          </Fit>
        )
      },
      {
        name: 'MPMeter',
        summary: {
          ko: '미리 알려진 눈금 위의 양. 프로그레스 바처럼 보이지만 다른 것을 뜻합니다',
          en: 'A quantity on a scale known in advance — it looks like a progress bar and means something else'
        },
        path: '/components/feedback/meter',
        preview: (
          <Fit>
            <MPMeter
              value={94}
              label="Quota spent"
              showValue
              thresholds={[
                { from: 60, color: 'tertiary' },
                { from: 85, color: 'error' }
              ]}
            />
          </Fit>
        )
      },
      {
        name: 'MPProgressCircular',
        summary: {
          ko: '바를 놓을 자리가 없는 곳의 링',
          en: 'A ring, for where there is no room for a bar'
        },
        path: '/components/feedback/progress-circular',
        preview: (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <MPProgressCircular value={70} showValue />
            <MPProgressCircular size="sm" />
          </div>
        )
      },
      {
        name: 'MPProgressBox',
        summary: {
          ko: '단계가 있는 일을 위한 조각들의 줄',
          en: 'A row of segments, for work that has steps'
        },
        path: '/components/feedback/progress-box',
        preview: <MPProgressBox value={50} count={4} />
      }
    ]
  },
  {
    title: { ko: '레이아웃', en: 'Layout' },
    note: {
      ko: '다른 것들이 놓일 자리를 정하는 것 — 그리고 그것들을 담는 시트.',
      en: 'It decides where everything else sits — and the sheets that hold it.'
    },
    entries: [
      {
        name: 'MPAccordion',
        summary: {
          ko: '한 번에 하나만 열리는 구획의 묶음',
          en: 'A stack of sections, one of which is open'
        },
        path: '/components/layout/accordion',
        preview: (
          <Fit>
            <MPAccordion size="sm" defaultValue={['delivery']}>
              <MPAccordionItem value="delivery" title="Delivery">
                Three to five working days.
              </MPAccordionItem>
              <MPAccordionItem value="returns" title="Returns">
                Thirty days, postage paid.
              </MPAccordionItem>
            </MPAccordion>
          </Fit>
        )
      },
      {
        name: 'MPAspectRatio',
        summary: {
          ko: '어떤 너비를 받든 비율을 지키는 상자',
          en: 'A box that keeps a proportion whatever width it is given'
        },
        path: '/components/layout/aspect-ratio',
        preview: (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%' }}>
            {['1 / 1', '4 / 3', '16 / 9'].map((ratio) => (
              <MPAspectRatio
                key={ratio}
                ratio={ratio}
                rounded
                size="sm"
                className="bg-mp-surface-container-highest"
              >
                <div className="text-mp-on-surface-variant text-mp-label-small flex h-full w-full items-center justify-center">
                  {ratio}
                </div>
              </MPAspectRatio>
            ))}
          </div>
        )
      },
      {
        name: 'MPBox',
        summary: {
          ko: '내용이 놓인 한 장의 시트. 가장 단순한 표면',
          en: 'A sheet with content on it — the plainest surface there is'
        },
        path: '/components/layout/box',
        preview: (
          <Fit>
            <div style={{ display: 'grid', gap: 8 }}>
              <MPBox size="sm">Outlined</MPBox>
              <MPBox size="sm" variant="filled">
                Filled
              </MPBox>
            </div>
          </Fit>
        )
      },
      {
        name: 'MPBottomNavigation',
        summary: {
          ko: '창 아래 가장자리에 붙어 있는 목적지들의 행',
          en: 'A row of destinations held against the bottom edge of the window'
        },
        path: '/components/layout/bottom-navigation',
        preview: (
          <Fit>
            <MPBottomNavigation
              label="Main"
              position="static"
              size="sm"
              defaultValue="home"
              className="rounded-mp-lg"
            >
              <MPBottomNavigationItem value="home" icon={<MPIcon icon={ICONS.info} />}>
                Home
              </MPBottomNavigationItem>
              <MPBottomNavigationItem value="search" icon={<MPIcon icon={ICONS.search} />}>
                Search
              </MPBottomNavigationItem>
              <MPBottomNavigationItem value="saved" icon={<MPIcon icon={ICONS.check} />}>
                Saved
              </MPBottomNavigationItem>
            </MPBottomNavigation>
          </Fit>
        )
      },
      {
        name: 'MPTabs',
        summary: {
          ko: '여러 패널 중 하나를 보여 주는 묶음',
          en: 'One set of panels, one of which is shown'
        },
        path: '/components/layout/tabs',
        preview: (
          <Fit>
            <MPTabs aria-label="Library" defaultValue="albums" size="sm" fullWidth>
              <MPTab value="albums">Albums</MPTab>
              <MPTab value="artists">Artists</MPTab>

              <MPTabPanel value="albums">Four added this week.</MPTabPanel>
              <MPTabPanel value="artists">Twelve artists.</MPTabPanel>
            </MPTabs>
          </Fit>
        )
      },
      {
        name: 'MPContainer',
        summary: {
          ko: '페이지 여백, 그리고 필요하다면 본문 폭',
          en: 'The page margin, and optionally a measure'
        },
        path: '/components/layout/container',
        preview: (
          <div
            style={{
              width: '100%',
              outline: '1px dashed var(--mp-sys-color-outline-variant)'
            }}
          >
            <MPContainer maxWidth="xs" size="sm">
              <div className="bg-mp-surface-container-highest text-mp-on-surface-variant text-mp-label-small rounded-mp-xs flex h-12 items-center justify-center">
                maxWidth=&quot;xs&quot;
              </div>
            </MPContainer>
          </div>
        )
      },
      {
        name: 'MPFlex',
        summary: {
          ko: '행이나 열, 그리고 둘 사이가 바뀌는 너비',
          en: 'A row or a column, and the width at which it changes'
        },
        path: '/components/layout/flex',
        preview: (
          <MPFlex
            direction={{ compact: 'column', medium: 'row' }}
            gap={8}
            style={{ width: '100%' }}
          >
            {['row', 'from', '600dp'].map((label) => (
              <div
                key={label}
                className="bg-mp-surface-container-highest text-mp-on-surface-variant text-mp-label-small rounded-mp-xs flex h-8 flex-1 items-center justify-center"
              >
                {label}
              </div>
            ))}
          </MPFlex>
        )
      },
      {
        name: 'MPScrollArea',
        summary: {
          ko: '자기 스크롤바를 가진 상자. 어디서나 같은 너비와 색입니다',
          en: 'A box with a scrollbar of its own — the same width and colour everywhere'
        },
        path: '/components/layout/scroll-area',
        preview: (
          <Fit>
            <MPScrollArea maxHeight={96} persistent size="sm" style={{ width: '100%' }}>
              <div className="text-mp-on-surface-variant text-mp-body-small flex flex-col gap-2 pe-3">
                {['Inbox', 'Starred', 'Snoozed', 'Sent', 'Drafts', 'Spam'].map((row) => (
                  <span key={row}>{row}</span>
                ))}
              </div>
            </MPScrollArea>
          </Fit>
        )
      },
      {
        name: 'MPMockup',
        summary: {
          ko: '진짜 페이지가 들어 있는 기기 그림',
          en: 'A picture of a device with a real page inside it'
        },
        path: '/components/layout/mockup',
        preview: (
          <Fit>
            <MPMockup device="mobile" height={110} systemUi={false}>
              <div className="bg-mp-surface-container-high size-full" />
            </MPMockup>
          </Fit>
        )
      },
      {
        name: 'MPFloatingBottomNavigation',
        summary: {
          ko: '아래 가장자리에서 떠 있는 목적지들. 내용은 그 밑으로 흐릅니다',
          en: 'Destinations floating clear of the bottom edge, with the content running underneath'
        },
        path: '/components/layout/floating-bottom-navigation',
        preview: (
          <Fit>
            <MPFloatingBottomNavigation size="xs" position="static" defaultValue="home">
              <MPBottomNavigationItem value="home" icon={<MPIcon icon={ICONS.search} />}>
                Explore
              </MPBottomNavigationItem>
              <MPBottomNavigationItem value="saved" icon={<MPIcon icon={ICONS.star} />}>
                Saved
              </MPBottomNavigationItem>
            </MPFloatingBottomNavigation>
          </Fit>
        )
      },
      {
        name: 'MPToolbar',
        summary: {
          ko: '컨트롤이 늘어선 바. 슬롯 셋과 행 하나',
          en: 'A bar of controls — three slots and a row'
        },
        path: '/components/layout/toolbar',
        preview: (
          <Fit>
            <MPToolbar
              size="xs"
              variant="filled"
              start={<MPTypography level="caption">Voltage</MPTypography>}
              end={
                <MPButton size="xs" variant="filled">
                  Deploy
                </MPButton>
              }
              style={{ width: '100%' }}
            />
          </Fit>
        )
      },
      {
        name: 'MPScrollZone',
        summary: {
          ko: '한 방향으로 놓이고 그 방향으로 스크롤되는 띠. 원하는 만큼의 줄로 배치됩니다',
          en: 'A strip of anything, laid out in one direction and scrolled in it, in as many lines as you ask for'
        },
        path: '/components/layout/scroll-zone',
        preview: (
          <Fit>
            <MPScrollZone size="xs" buttons="always" style={{ width: '100%' }}>
              {['Espresso', 'Filter', 'Cold brew', 'Decaf', 'Blends'].map((category) => (
                <MPChip key={category}>{category}</MPChip>
              ))}
            </MPScrollZone>
          </Fit>
        )
      },
      {
        name: 'MPPortal',
        summary: {
          ko: 'DOM의 다른 곳에 렌더되는 자식. 잘림과 쌓임 맥락에서 빠져나옵니다',
          en: 'Children rendered elsewhere in the DOM, out of a clipping or stacking context'
        },
        path: '/components/layout/portal',
        preview: (
          <Fit>
            <div
              className="border-mp-outline-variant rounded-mp-xs relative flex h-16 w-full items-center justify-center overflow-hidden border"
              style={{ isolation: 'isolate' }}
            >
              <span className="text-mp-on-surface-variant text-mp-label-small">this box clips</span>
              <span className="bg-mp-tertiary-container text-mp-on-tertiary-container text-mp-label-small absolute -bottom-3 start-2 rounded px-2 py-0.5">
                a portal is not in it
              </span>
            </div>
          </Fit>
        )
      },
      {
        name: 'MPGrid',
        summary: {
          ko: '윈도우 크기 클래스를 따라 바뀌는 머터리얼의 레이아웃 그리드',
          en: "Material's layout grid, changing with the window size class"
        },
        path: '/components/layout/grid',
        preview: (
          <MPGrid spacing={2} style={{ width: '100%' }}>
            {[12, 6, 6, 4, 4, 4].map((span, index) => (
              <MPGridItem key={index} span={span}>
                <div className="bg-mp-surface-container-highest text-mp-on-surface-variant text-mp-label-small rounded-mp-xs flex h-8 items-center justify-center">
                  {span}
                </div>
              </MPGridItem>
            ))}
          </MPGrid>
        )
      },
      {
        name: 'MPCard',
        summary: {
          ko: '카드를 이루는 부분들을 배치한 박스',
          en: 'A box with the parts a card is made of laid out on it'
        },
        path: '/components/layout/card',
        preview: (
          <Fit>
            <MPCard
              size="sm"
              variant="elevated"
              title="Weekly digest"
              subtitle="Every Monday"
              footer={
                <MPButton size="xs" variant="text">
                  Send
                </MPButton>
              }
            >
              Forty-two opens last week.
            </MPCard>
          </Fit>
        )
      },
      {
        name: 'MPCarousel',
        summary: {
          ko: '한 장씩 스냅되는 슬라이드의 띠',
          en: 'A strip of slides, one of which is in view'
        },
        path: '/components/layout/carousel',
        preview: (
          <Fit>
            <MPCarousel size="xs" label="Mountains">
              {['Namsan', 'Bukhansan', 'Gwanaksan'].map((name, index) => (
                <div
                  key={name}
                  className="text-mp-on-surface text-mp-label-large flex h-20 items-center justify-center"
                  style={{
                    background: `var(--_mp-color-${
                      ['primary', 'secondary', 'tertiary'][index]
                    }-container)`
                  }}
                >
                  {name}
                </div>
              ))}
            </MPCarousel>
          </Fit>
        )
      },
      {
        name: 'MPCollapsible',
        summary: {
          ko: '혼자 서 있는, 접히는 한 구획',
          en: 'One section that folds, standing on its own'
        },
        path: '/components/layout/collapsible',
        preview: (
          <Fit>
            <MPCollapsible size="sm" title="Delivery options" subtitle="Standard, chosen">
              Three to five working days, included in the price.
            </MPCollapsible>
          </Fit>
        )
      },
      {
        name: 'MPDrawer',
        summary: {
          ko: '창의 한쪽 가장자리에 붙는 패널',
          en: 'A panel attached to one edge of the window'
        },
        path: '/components/layout/drawer',
        preview: (
          <Fit>
            <MPDrawer
              mode="standard"
              size="xs"
              rounded
              title="Sections"
              description="Standard mode, in the layout"
            >
              <MPList variant="text" size="sm">
                <MPListItem selected onClick={() => {}}>
                  Overview
                </MPListItem>
                <MPListItem onClick={() => {}}>Schedule</MPListItem>
              </MPList>
            </MPDrawer>
          </Fit>
        )
      },
      {
        name: 'MPFooter',
        summary: {
          ko: '문서가 끝났다고 말하는, 페이지 끝의 시트',
          en: 'The sheet at the end that says the document ended'
        },
        path: '/components/layout/footer',
        preview: (
          <Fit>
            <MPFooter size="sm" variant="tonal" className="rounded-mp-xs">
              <div className="flex items-center justify-between gap-3">
                <MPTypography level="caption">© 2026 Acme</MPTypography>
                <MPTextLink href="#terms">Terms</MPTextLink>
              </div>
            </MPFooter>
          </Fit>
        )
      },
      {
        name: 'MPHeader',
        summary: {
          ko: '페이지 맨 위의 바 — 마크, 가운데, 액션',
          en: 'The bar across the top: mark, middle, actions'
        },
        path: '/components/layout/header',
        preview: (
          <Fit>
            <div className="border-mp-outline-variant rounded-mp-xs w-full overflow-hidden border">
              <MPHeader
                position="static"
                size="xs"
                variant="outlined"
                brand="Acme"
                actions={<MPButton size="xs">Sign in</MPButton>}
              />
            </div>
          </Fit>
        )
      },
      {
        name: 'MPNavigationMenu',
        summary: {
          ko: '패널이 열리는 목적지의 행',
          en: 'A row of destinations, some of which open a panel'
        },
        path: '/components/layout/navigation-menu',
        preview: (
          <Fit>
            <MPNavigationMenu aria-label="Main" size="sm">
              <MPNavigationMenuItem value="product" label="Product">
                <MPNavigationMenuLink href="#overview" title="Overview" />
                <MPNavigationMenuLink href="#pricing" title="Pricing" />
              </MPNavigationMenuItem>
              <MPNavigationMenuItem label="Docs" href="#docs" />
            </MPNavigationMenu>
          </Fit>
        )
      },
      {
        name: 'MPPageLayout',
        summary: {
          ko: '페이지를 걸어 두는 뼈대 — 그리고 그 랜드마크',
          en: 'The skeleton a page is hung on, and its landmarks'
        },
        path: '/components/layout/page-layout',
        preview: (
          <Fit>
            <PageLayoutPreview />
          </Fit>
        )
      },
      {
        name: 'MPSidebar',
        summary: {
          ko: '본문 옆의 열, 좁아지면 서랍',
          en: 'A column beside the content, a drawer once it is narrow'
        },
        path: '/components/layout/sidebar',
        preview: (
          <Fit>
            <SidebarPreview />
          </Fit>
        )
      },
      {
        name: 'MPPanes',
        summary: {
          ko: '사이에 끌 수 있는 핸들이 놓인 패널 묶음',
          en: 'A set of panes with draggable handles between them'
        },
        path: '/components/layout/panes',
        preview: (
          <Fit>
            <PanesPreview />
          </Fit>
        )
      },
      {
        name: 'MPStack',
        summary: {
          ko: '서로 겹쳐 쌓인 것들',
          en: 'Things laid over each other in a pile'
        },
        path: '/components/layout/stack',
        preview: (
          <Fit>
            <MPStack
              ring
              size="sm"
              max={3}
              total={9}
              overflow={(n) => <MPAvatar initials={`+${n}`} />}
            >
              <MPAvatar size="sm" name="Ada Lovelace" />
              <MPAvatar size="sm" name="Alan Turing" />
              <MPAvatar size="sm" name="Grace Hopper" />
            </MPStack>
          </Fit>
        )
      }
    ]
  },
  {
    title: { ko: '모션', en: 'Motion' },
    note: {
      ko: '다른 것을 감싸고 움직이게 하는 것. 스스로는 아무것도 그리지 않습니다.',
      en: 'It wraps something else and makes it move. None of them draw anything of their own.'
    },
    entries: [
      {
        name: 'MPAnimateFade',
        summary: {
          ko: '불투명도만으로 나타나거나 사라지는 내용',
          en: 'Content arriving or leaving on opacity alone'
        },
        path: '/components/motion/animate-fade',
        preview: (
          <Fit>
            <MPAnimateFade repeat="infinite" alternate from={0.15} duration={1600}>
              <MPBox size="sm">
                <MPTypography level="body">Fade</MPTypography>
              </MPBox>
            </MPAnimateFade>
          </Fit>
        )
      },
      {
        name: 'MPAnimateGrow',
        summary: {
          ko: '한 점에서 펼쳐져 나오는 내용',
          en: 'Content unfolding from a point'
        },
        path: '/components/motion/animate-grow',
        preview: (
          <Fit>
            <MPAnimateGrow
              origin="top left"
              from={0.7}
              repeat="infinite"
              alternate
              fade={false}
              duration={1600}
            >
              <MPBox size="sm">
                <MPTypography level="body">Grow</MPTypography>
              </MPBox>
            </MPAnimateGrow>
          </Fit>
        )
      },
      {
        name: 'MPAnimateZoom',
        summary: {
          ko: '자리잡을 곳의 한가운데에서 도착하는 내용',
          en: 'Content arriving from the middle of where it will end up'
        },
        path: '/components/motion/animate-zoom',
        preview: (
          <Fit>
            <MPAnimateZoom from={0.5} repeat="infinite" alternate duration={1600}>
              <MPBox size="sm">
                <MPTypography level="body">Zoom</MPTypography>
              </MPBox>
            </MPAnimateZoom>
          </Fit>
        )
      },
      {
        name: 'MPAnimateSlide',
        summary: {
          ko: '한쪽 가장자리에서 이동해 들어오는 내용',
          en: 'Content travelling in from one edge'
        },
        path: '/components/motion/animate-slide',
        preview: (
          <Fit>
            <MPAnimateSlide
              from="left"
              distance="1.5rem"
              repeat="infinite"
              alternate
              duration={1600}
            >
              <MPBox size="sm">
                <MPTypography level="body">Slide</MPTypography>
              </MPBox>
            </MPAnimateSlide>
          </Fit>
        )
      },
      {
        name: 'MPAnimateReveal',
        summary: {
          ko: '이미 있는 자리에서 걷혀 드러나는 내용',
          en: 'Content uncovered where it already is'
        },
        path: '/components/motion/animate-reveal',
        preview: (
          <Fit>
            <MPAnimateReveal repeat="infinite" alternate duration={1600}>
              <MPBox size="sm">
                <MPTypography level="body">Reveal</MPTypography>
              </MPBox>
            </MPAnimateReveal>
          </Fit>
        )
      },
      {
        name: 'MPAnimateRotate',
        summary: {
          ko: '한 점을 중심으로 도는 내용',
          en: 'Content turning about a point'
        },
        path: '/components/motion/animate-rotate',
        preview: (
          <Fit>
            <MPAnimateRotate
              from={0}
              to={360}
              repeat="infinite"
              easing="linear"
              fade={false}
              duration={2600}
            >
              <MPIcon icon={ICONS.spinner} size={28} />
            </MPAnimateRotate>
          </Fit>
        )
      },
      {
        name: 'MPAnimateFloat',
        summary: {
          ko: '페이지에 고정되어 있지 않은 것',
          en: 'Something not fixed to the page'
        },
        path: '/components/motion/animate-float',
        preview: (
          <Fit>
            <MPAnimateFloat duration={3200} tilt={3}>
              <MPBox size="sm">
                <MPTypography level="body">Float</MPTypography>
              </MPBox>
            </MPAnimateFloat>
          </Fit>
        )
      },
      {
        name: 'MPAnimateShake',
        summary: {
          ko: '되지 않은 일에 대한 응답',
          en: 'The answer to something that did not work'
        },
        path: '/components/motion/animate-shake',
        preview: (
          <Fit>
            <MPAnimateShake trigger="hover">
              <MPBox size="sm">
                <MPTypography level="body">Shake</MPTypography>
              </MPBox>
            </MPAnimateShake>
          </Fit>
        )
      },
      {
        name: 'MPAnimateBlink',
        summary: {
          ko: '가득과 바닥값 사이를 오가며 맥동하는 내용',
          en: 'Content pulsing between full opacity and a floor'
        },
        path: '/components/motion/animate-blink',
        preview: (
          <Fit>
            <MPAnimateBlink min={0.35} duration={1600}>
              <MPChip variant="tonal" color="error">
                Live
              </MPChip>
            </MPAnimateBlink>
          </Fit>
        )
      },
      {
        name: 'MPAnimateAppear',
        summary: {
          ko: '여러 개가 차례로 자리를 잡는 목록',
          en: 'A list of things settling into place one after another'
        },
        path: '/components/motion/animate-appear',
        preview: (
          <Fit>
            <MPAnimateAppear
              trigger="visible"
              once={false}
              threshold={0.4}
              render={<div style={{ display: 'grid', gap: 8, width: '100%' }} />}
            >
              <MPBox size="sm">
                <MPTypography level="caption">One</MPTypography>
              </MPBox>
              <MPBox size="sm">
                <MPTypography level="caption">Two</MPTypography>
              </MPBox>
              <MPBox size="sm">
                <MPTypography level="caption">Three</MPTypography>
              </MPBox>
            </MPAnimateAppear>
          </Fit>
        )
      },
      {
        name: 'MPAnimateLighting',
        summary: {
          ko: '무언가의 바깥을 도는 빛',
          en: 'A light travelling around the outside of something'
        },
        path: '/components/motion/animate-lighting',
        preview: (
          <Fit>
            <MPAnimateLighting size="sm" spread={4} arc={70}>
              <MPBox size="sm" variant="filled">
                <MPTypography level="body">Lighting</MPTypography>
              </MPBox>
            </MPAnimateLighting>
          </Fit>
        )
      },
      {
        name: 'MPAnimateMarquee',
        summary: {
          ko: '끝없이 흘러가는 내용',
          en: 'Content scrolling steadily past, forever'
        },
        path: '/components/motion/animate-marquee',
        preview: (
          <Fit>
            <MPAnimateMarquee speed={40} gap="0.75rem">
              <MPChip variant="tonal">React</MPChip>
              <MPChip variant="tonal">Base UI</MPChip>
              <MPChip variant="tonal">Tailwind</MPChip>
            </MPAnimateMarquee>
          </Fit>
        )
      },
      {
        name: 'MPAnimateCounter',
        summary: {
          ko: '자기 값까지 세어 올라가는 숫자',
          en: 'A number counting up to its value'
        },
        path: '/components/motion/animate-counter',
        preview: (
          <Fit>
            <MPBox size="sm">
              <MPTypography level="body">
                <MPAnimateCounter
                  value={128400}
                  duration={2400}
                  options={{ notation: 'compact' }}
                />
              </MPTypography>
            </MPBox>
          </Fit>
        )
      },
      {
        name: 'MPAnimateHeadline',
        summary: {
          ko: '한 줄이 위의 줄을 대신하며 도는 릴',
          en: 'One line replacing the one above it, on a timer'
        },
        path: '/components/motion/animate-headline',
        preview: (
          <Fit>
            <MPAnimateHeadline interval={2000}>
              <MPTypography level="h6" color="primary" gutter={false}>
                Material
              </MPTypography>
              <MPTypography level="h6" color="secondary" gutter={false}>
                Design 3
              </MPTypography>
              <MPTypography level="h6" color="tertiary" gutter={false}>
                in React
              </MPTypography>
            </MPAnimateHeadline>
          </Fit>
        )
      },
      {
        name: 'MPAnimateScramble',
        summary: {
          ko: '노이즈에서 가라앉는 텍스트',
          en: 'Text settling out of noise'
        },
        path: '/components/motion/animate-scramble',
        preview: (
          <Fit>
            <MPAnimateScramble
              repeat="infinite"
              duration={2200}
              style={{ fontSize: 15, fontWeight: 500 }}
            >
              SCRAMBLE
            </MPAnimateScramble>
          </Fit>
        )
      },
      {
        name: 'MPAnimateSplit',
        summary: {
          ko: '단어나 글자 단위로 도착하는 한 줄',
          en: 'A line arriving a word or a character at a time'
        },
        path: '/components/motion/animate-split',
        preview: (
          <Fit>
            <MPAnimateSplit
              stagger={90}
              repeat="infinite"
              alternate
              duration={900}
              style={{ fontSize: 15 }}
            >
              Split the line
            </MPAnimateSplit>
          </Fit>
        )
      },
      {
        name: 'MPAnimateTyping',
        summary: {
          ko: '한 글자씩 나타나는 텍스트',
          en: 'Text appearing one character at a time'
        },
        path: '/components/motion/animate-typing',
        preview: (
          <Fit>
            <MPAnimateTyping text="one character at a time" speed={14} repeat="infinite" erase />
          </Fit>
        )
      }
    ]
  }
];

function EntryCard({ entry, locale, base }: { entry: Entry; locale: Locale; base: string }) {
  return (
    <a href={`${base}${entry.path}`} className="mp-gallery-card">
      <div className="mp-gallery-preview">{entry.preview}</div>
      <div className="mp-gallery-meta">
        <span className="mp-gallery-name">{entry.name}</span>
        <span className="mp-gallery-summary">{entry.summary[locale]}</span>
      </div>
    </a>
  );
}

export default function AllComponents({
  locale = DEFAULT_LOCALE,
  base = ''
}: {
  locale?: Locale;
  /** URL prefix of the locale this page is in — `''` at the root, `/ko` otherwise. */
  base?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {GROUPS.map((group) => (
        <section key={group.title.en} className="mp-gallery-group">
          <div className="mp-gallery-heading">
            <span className="mp-gallery-title">{group.title[locale]}</span>
            <span className="mp-gallery-note">{group.note[locale]}</span>
          </div>
          <div className="mp-gallery-grid">
            {group.entries.map((entry) => (
              <EntryCard key={entry.name} entry={entry} locale={locale} base={base} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
