export default defineEventHandler(async (event) => {
  const token = await getBearerToken(event);
  const targetPath = getTargetPath(event);

  return await fetchNest(targetPath, {
    method: event.method,
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  }).catch((error) => {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || "Internal Server Error",
    });
  });
});
