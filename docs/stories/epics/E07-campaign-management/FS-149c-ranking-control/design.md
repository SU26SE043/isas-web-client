# Design

The employer campaign experience remains dark monochrome with satin frames and bilingual
translations. Criteria are manual or copied from a read-only system preview. Score anchors
are read-only; `minPct` is the only employer-configurable floor. Questions expose their group
and use “Luôn hỏi” to distinguish them from must-have CV needs. Job needs are grouped in a
collapsible/detail context and each row carries an explicit `isMustHave` flag.

SCP1-F1..F4 (expression editor, template selection, preview/apply for employer) are not
implemented because the employer has no expression decision to make; the backend remains
available for administrator policy management.
