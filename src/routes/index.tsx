
import { createAsync, useNavigate, useSubmission } from "@solidjs/router";
import { Button } from "~/components/ui/button";
import { Callout, CalloutTitle } from "~/components/ui/callout";
import { Input } from "~/components/ui/input";
import { loginOrRegister } from "~/lib/actions";
import { getUser } from "~/lib/data"

export default function Home() {
  const user = createAsync(() => getUser(), { deferStream: true });
  const navigate = useNavigate();
  if (user()) {
    navigate("/admin/polls", { replace: true });
  }
  const submission = useSubmission(loginOrRegister);

  return (
    <form action={loginOrRegister} method="post" class="grid w-full max-w-sm items-center gap-3 mx-auto">
      <h2 class="text-xl">Login/Register</h2>
      <Input type="email" id="email" name="email" placeholder="Email" />
      <Input type="password" id="password" name="password" placeholder="Password" />
      <div class="flex mx-auto">
        <Button type="submit" name="action" value="login">Login</Button>
        <Button type="submit" name="action" value="register" variant={"secondary"}>Register</Button>
      </div>
      {submission.result && (
        <Callout variant="error">
          <CalloutTitle>{submission.result.message}</CalloutTitle>
        </Callout>
      )}
    </form>
  );
}
