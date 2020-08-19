local newValue = tonumber(redis.call('INCR', KEYS[1]))
if newValue > tonumber(ARGV[1]) then
  return redis.call('PTTL', KEYS[1])
end
if newValue == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[2])
end
