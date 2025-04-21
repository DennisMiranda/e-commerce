export const onRequest = async (context, next) => {
  const token = context.cookies.get("token");
  console.log(token);

  if (["/login"].includes(context.url.pathname)) {
    if (token) return context.redirect("/");
    return next();
  }

  if (!token) return context.redirect("/login");

  return next();
};
