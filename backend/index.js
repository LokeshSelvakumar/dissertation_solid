const express = require("express");
const service = require("./crudService.js");
const cookieSession = require("cookie-session");

const {
  getSessionFromStorage,
  getSessionIdFromStorageAll,
  Session
} = require("@inrupt/solid-client-authn-node");

let applicationSession;

const app = express();
const port = 3000;

//app session to use app pod
const session = new Session();


// initiate single user app authentication from backend 
// app.get('/serverSession', function (req, res) {
//   // server ready to accept connections here

//   session.login({
//     // 2. Use the authenticated credentials to log in the session.
//     clientId: "8a909aee-39e3-4c97-a3b4-60e3c137a7ba",
//     clientSecret: "5be184bd-94d7-4002-9d24-5e61f82f4980",
//     oidcIssuer: "https://broker.pod.inrupt.com",
//     refreshToken: "undefined"
//   }).then(() => {
//     if (session.info.isLoggedIn) {
//       // 3. Your session should now be logged in, and able to make authenticated requests.
//       session
//         // You can change the fetched URL to a private resource, such as your Pod root.
//         .fetch(session.info.webId)
//         .then((response) => {
//           return response.text();
//         })
//         .then(console.log);
//     }
//     res.send(session.info.webId);
//   });
// });

// end point to check the app connection
app.get('/checkSession', function (req, res) {
  res.send(session.info);
});


// The following snippet ensures that the server identifies each user's session
// with a cookie using an express-specific mechanism
app.use(
  cookieSession({
    name: "session",
    // These keys are required by cookie-session to sign the cookies.
    keys: [
      "Required, but value not relevant for this demo - key1",
      "Required, but value not relevant for this demo - key2",
    ],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.use(express.urlencoded());
app.use(express.json());

app.post("/registerUser", async function (req, res) {
  console.log(Date.now());
  console.log("inside register user");
  // res.json({"response":"sending check text"});
  try {
    await service.checkUserExist(req.body,applicationSession.sessionId);
    await service.registerUser(req.body, applicationSession.sessionId);
  }
  catch(Exception){
    console.log(Exception);
    res.send(JSON.stringify("erron on the function"));
}
});

app.get("/login", async (req, res, next) => {
  // 1. Create a new Session
  console.log("request received");
  const session = new Session();
  req.session.sessionId = session.info.sessionId;
  const redirectToSolidIdentityProvider = (url) => {
    console.log("inside redirect");
    // Since we use Express in this example, we can call `res.redirect` to send the user to the
    // given URL, but the specific method of redirection depend on your app's particular setup.
    // For example, if you are writing a command line app, this might simply display a prompt for
    // the user to visit the given URL in their browser.
    res.redirect(url);
    // response.writeHead(301, {
    //   Location: `http://whateverhostthiswillbe:8675/${newRoom}`
    // }).end();
  };
  // 2. Start the login process; redirect handler will handle sending the user to their
  //    Solid Identity Provider.
  await session.login({
    // After login, the Solid Identity Provider will send the user back to the following
    // URL, with the data necessary to complete the authentication process
    // appended as query parameters:
    redirectUrl: `http://localhost:${port}/redirect-from-solid-idp`,
    // Set to the user's Solid Identity Provider; e.g., "https://login.inrupt.com" 
    oidcIssuer: "https://inrupt.net",
    // Pick an application name that will be shown when asked 
    // to approve the application's access to the requested data.
    clientName: "local demo app",
    handleRedirect: redirectToSolidIdentityProvider,
  });
});

app.get("/redirect-from-solid-idp", async (req, res) => {
  // 3. If the user is sent back to the `redirectUrl` provided in step 2,
  //    it means that the login has been initiated and can be completed. In
  //    particular, initiating the login stores the session in storage, 
  //    which means it can be retrieved as follows.
  applicationSession = req.session;
  const session = await getSessionFromStorage(req.session.sessionId);

  // 4. With your session back from storage, you are now able to 
  //    complete the login process using the data appended to it as query
  //    parameters in req.url by the Solid Identity Provider:
  await session.handleIncomingRedirect(`http://localhost:${port}${req.url}`);

  // 5. `session` now contains an authenticated Session instance.
  if (session.info.isLoggedIn) {
    return res.send(`<p>Logged in with the WebID ${session.info.webId}.</p>`)
  }
});

// 6. Once you are logged in, you can retrieve the session from storage, 
//    and perform authenticated fetches.
app.get("/fetch", async (req, res, next) => {
  if (typeof req.query["resource"] === "undefined") {
    res.send(
      "<p>Please pass the (encoded) URL of the Resource you want to fetch using `?resource=&lt;resource URL&gt;`.</p>"
    );
  }
  const session = await getSessionFromStorage(req.session.sessionId);
  console.log(await (await session.fetch(req.query["resource"])).text());
  res.send("<p>Performed authenticated fetch.</p>");
});

// 7. To log out a session, just retrieve the session from storage, and 
//    call the .logout method.
app.get("/logout", async (req, res, next) => {
  const session = await getSessionFromStorage(req.session.sessionId);
  session.logout();
  res.send(`<p>Logged out.</p>`);
});

// 8. On the server side, you can also list all registered sessions using the
//    getSessionIdFromStorageAll function.
app.get("/", async (req, res, next) => {
  const sessionIds = await getSessionIdFromStorageAll();
  for (const sessionId in sessionIds) {
    // Do something with the session ID...
  }
  res.send(
    `<p>There are currently [${sessionIds.length}] visitors.</p>`
  );
});

app.listen(port, () => {
  console.log(
    `Server running on port [${port}]. ` +
    `Visit [http://localhost:${port}/login] to log in to [broker.pod.inrupt.com].`
  );
});