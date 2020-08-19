# Scaling

rCTF can be split into two types of instances.

- Frontend instances are horizontally scalable and handle incoming requests
- A single leaderboard instance does leaderboard and graph data calculations.

## Smaller installations

For smaller rCTF installations, both instances can be run within a single process.
To do this, set `instanceType` or `RCTF_INSTANCE_TYPE` to `all`.

```yaml
instanceType: all
```

## Large installations

For larger rCTF installations, you can run infinite frontend instances, but make sure to only run a single leaderboard instance.
Frontend instances should have `instanceType` or `RCTF_INSTANCE_TYPE` set to `frontend`.

```yaml
instanceType: frontend
```

Leaderboard instances should have `instanceType` or `RCTF_INSTANCE_TYPE` set to `leaderboard`.

```yaml
instanceType: leaderboard
```
