import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

import "./app.css";
import "@fontsource/inter"

export default function App() {
  return (
    <Router
      root={props => (
        <>
          <main class="mx-auto text-gray-700 p-4">
            <h1 class="text-3xl font-bold pb-6 text-center"><a href="/admin/polls">Solid Poll</a></h1>

            <div class="grid w-full max-w-xl items-center gap-3 mx-auto">
              <Suspense>{props.children}</Suspense>
            </div>
          </main>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
