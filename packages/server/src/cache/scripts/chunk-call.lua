-- The max number of arguments to a lua function is 7999. The cmd and key must be included with every redis call.
-- Because hashes are specified as a value after a key, the chunk size must also be even.
-- Therefore, the chunk size is set at 7996.

local function chunkCall(cmd, key, args)
  local size = 7996
  local len = #args
  local chunks = math.ceil(len / size)
  for i = 1, chunks do
    local start = (i - 1) * size + 1
    local stop = math.min(len, i * size)
    redis.call(cmd, key, unpack(args, start, stop))
  end
end
