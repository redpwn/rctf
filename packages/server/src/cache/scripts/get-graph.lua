-- this script is not compatible with redis cluster as it computes key names at runtime

local maxUsers = tonumber(ARGV[1])
local latest = redis.call('LRANGE', KEYS[1], 0, maxUsers * 3 - 1)
if #latest == 0 then
  return nil
end
local users = {}
for i = 1, maxUsers do
  local id = latest[i * 3 - 2]
  if id ~= nil then
    users[i] = redis.call('HGETALL', 'graph:'..id)
  end
end
local lastUpdate = redis.call('GET', KEYS[2])
return cjson.encode({
  lastUpdate,
  latest,
  users
})
