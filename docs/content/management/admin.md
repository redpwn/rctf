# Challenge Admin

rCTF integrates with [rCDS](https://github.com/redpwn/rcds), which can automatically deploy challenges and sync them to rCTF.

To use rCTF without rCDS, create an admin user normally. Then, connect to postgreSQL and run:

```sql
UPDATE users SET perms=3 WHERE id='your user id';
```

After running, you can manage the CTF's challenges using a web UI at:

```
https://your-rctf.example.com/admin/challs
```
