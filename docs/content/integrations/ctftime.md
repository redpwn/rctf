# CTFtime OAuth

To allow teams to login via their CTFtime teams, you need an event on CTFtime. You can [register for one here](https://ctftime.org/event/mail/).

In the OAuth endpoint field on the event editing page, enter:
```
https://your-rctf.example.com/integrations/ctftime/callback
```

Copy the client ID and client secret and place them in `ctftime.clientId` and `ctftime.clientSecret` or `RCTF_CTFTIME_CLIENT_ID` and `RCTF_CTFTIME_CLIENT_SECRET`.

```yaml
ctftime:
  clientId: 123
  clientSecret: abcd
```
