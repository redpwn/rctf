# Divisions

Divisions can be used in rCTF to segregate users into different scoreboards, with optional access control lists based on verified email addresses.
Every user must be in exactly one division, although users can change their division at any time (provided the new division satisfies the ACL).

- `divisions` is a map from a division ID to its human readable name shown in the UI.
- `defaultDivision` is the division ID that new users will be placed into.
- `divisionACLs` is a priority list of ACL elements. Only one element matches an email at a time, and each element contains `match`, `value`, and an allowed `divisions` list. If the `divisions` list contains multiple elements, the first element is used while registering.

Possible `match` values are:

- `domain`: The `value` contains a domain which the user's email must be from.
- `email`: The `value` contains an exact email which the user's must match.
- `regex`: The `value` contains a RegEx used to match the user's domain.
- `any`: All emails are matched. The `value` is ignored.

To define a list of divisions with no restrictions, set `divisions` and `defaultDivision`:

```yaml
divisions:
  open: Open
  hs: High School
  college: College
defaultDivision: open
```

To define a list of restricted divisions:

```yaml
divisions:
  corp: Example Corp
  open: Open
divisionACLs:
  - match: domain
    value: example.com
    divisions:
      - corp
  - match: email
    value: external-user@example.org
    divisions:
      - corp
  - match: any
    value: ''
    divisions:
      - open
```
