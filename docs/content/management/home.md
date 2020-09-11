# Home Page

The home page of your CTF can be configured with various content in markdown and HTML via `homeContent` or `RCTF_HOME_CONTENT`.

In addition to normal HTML, you can use some custom elements.

- `<timer></timer>`: a countdown timer until the beginning or end of the CTF
- `<sponsors></sponsors>`: a list of sponsor cards ([see configuration](#sponsor-cards))
- `<action-button></action-button>`: a button with hover effects, generally used as a link to `/register`

```yaml
homeContent: |
  # Heading

  ### Subheading
  Text

  <action-button href="/register">
    <span>Register Now</span>
    <svg viewBox="4 4 16 16"><path fill="#ffffff" d="M16.01 11H4v2h12.01v3L20 12l-3.99-4z"></path></svg>
  </action-button>

  <timer></timer>

  ### Sponsors
  Thank you to our wonderful sponsors for making this event possible!

  <sponsors></sponsors>
```

## Sponsor Cards

The `<sponsors>` element can be used to display cards for the sponsors listed in
the config under `sponsors`.

### Configuration

The `sponsors` key takes an array of sponsor elements, which are each an object
with the following properties:

| Key           | Default  | Description                       |
| ------------- | -------- | --------------------------------- |
| `name`        | _(none)_ | sponsor name                      |
| `icon`        | _(none)_ | sponsor icon URL                  |
| `description` | _(none)_ | sponsor description               |
| `small`       | `false`  | whether to show as a compact card |

### Example

```yaml
sponsors:
  - name: Foo
    icon: https://example.com/foo.png
    description: |
      An excellent sponsor
  - name: Bar
    icon: https://example.com/bar.png
    description: |
      An excellent sponsor
    small: true
```
