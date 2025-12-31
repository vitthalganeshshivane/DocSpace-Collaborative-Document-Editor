import { Liveblocks } from "@liveblocks/node";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { room } = await req.json();

  if (!room) {
    return new Response("Missing room id", { status: 400 });
  }

  // ✅ SINGLE SOURCE OF TRUTH — NEVER CHANGE
  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name:
        user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous",
      avatar: user.imageUrl,
    },
  });

  session.allow(room, session.FULL_ACCESS);

  const { body, status } = await session.authorize();
  return new Response(body, { status });
}

// import { Liveblocks } from "@liveblocks/node";
// import { currentUser } from "@clerk/nextjs/server";
// import { NextRequest } from "next/server";

// const liveblocks = new Liveblocks({
//   secret: process.env.LIVEBLOCKS_SECRET_KEY!,
// });

// export async function POST(req: NextRequest) {
//   const user = await currentUser();

//   if (!user) {
//     return new Response("Unauthorized", { status: 401 });
//   }

//   const { room } = await req.json();

//   if (!room) {
//     return new Response("Missing room id", { status: 400 });
//   }

//   // 🔒 SINGLE SOURCE OF TRUTH
//   const session = liveblocks.prepareSession(user.id, {
//     userInfo: {
//       name:
//         user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous",
//       avatar: user.imageUrl,
//     },
//   });

//   session.allow(room, session.FULL_ACCESS);

//   const { body, status } = await session.authorize();
//   return new Response(body, { status });
// }

// import { Liveblocks } from "@liveblocks/node";
// import { ConvexHttpClient } from "convex/browser";
// // import { auth, currentUser } from "@clerk/nextjs/server";
// // import { NextRequest, NextResponse } from "next/server";
// // import { api } from "../../../../convex/_generated/api";

// // import { auth, currentUser } from "@clerk/nextjs/server";
// import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
// import { NextRequest } from "next/server";
// import { api } from "../../../../convex/_generated/api";
// import { Id } from "../../../../convex/_generated/dataModel";

// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// const liveblocks = new Liveblocks({
//   secret: process.env.LIVEBLOCKS_SECRET_KEY!,
// });

// // export async function POST(req: NextRequest) {
// //   const { sessionClaims } = await auth();

// //   if (!sessionClaims) {
// //     return new NextResponse("Unauthrized", { status: 401 });
// //   }

// //   const user = await currentUser();
// //   if (!user) {
// //     return new NextResponse("Unauthrized", { status: 401 });
// //   }

// //   const { room } = await req.json();
// //   const document = await convex.query(api.documents.getById, { id: room });

// //   if (!document) {
// //     return new Response("Unathorized", { status: 401 });
// //   }

// //   const isOwner = document.ownerId === user.id;
// //   const isOrganizationMember = document.organizationId === sessionClaims.org_id;

// //   if (!isOwner && !isOrganizationMember) {
// //     return new Response("Unathorized", { status: 401 });
// //   }

// //   const session = liveblocks.prepareSession(user.id, {
// //     userInfo: {
// //       name: user.fullName ?? "Anonymous",
// //       avatar: user.imageUrl,
// //     },
// //   });
// //   session.allow(room, session.FULL_ACCESS);

// //   const { body, status } = await session.authorize();

// //   return new Response(body, { status });
// // }

// // export async function POST(req: NextRequest) {
// //   const { sessionClaims } = await auth();
// //   if (!sessionClaims) return new Response("Unauthorized", { status: 401 });

// //   const user = await currentUser();
// //   if (!user) return new Response("Unauthorized", { status: 401 });

// //   const { room } = await req.json();

// //   const document = await convex.query(api.documents.getById, {
// //     id: room as Id<"documents">,
// //   });

// //   if (!document) return new Response("Unauthorized", { status: 401 });

// //   // const isOwner = document.ownerId === user.id;
// //   // const isOrgMember =
// //   //   document.organizationId && document.organizationId === sessionClaims.org_id;

// //   // if (!isOwner && !isOrgMember) {
// //   //   return new Response("Unauthorized", { status: 401 });
// //   // }

// //   const isOwner = document.ownerId === user.id;

// //   let isOrgMember = false;

// //   if (document.organizationId) {
// //     const memberships = await (
// //       await clerkClient()
// //     ).organizations.getOrganizationMembershipList({
// //       organizationId: document.organizationId,
// //     });

// //     isOrgMember = memberships.data.some(
// //       (m) => m.publicUserData?.userId === user.id
// //     );
// //   }

// //   if (!isOwner && !isOrgMember) {
// //     return new Response("Unauthorized", { status: 401 });
// //   }

// //   const session = liveblocks.prepareSession(user.id, {
// //     userInfo: {
// //       name:
// //         user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous",
// //       avatar: user.imageUrl,
// //     },
// //   });

// //   session.allow(room, session.FULL_ACCESS);

// //   const { body, status } = await session.authorize();
// //   return new Response(body, { status });
// // }

// export async function POST(req: NextRequest) {
//   try {
//     const { sessionClaims } = await auth();
//     if (!sessionClaims) {
//       return new Response("Unauthorized", { status: 401 });
//     }

//     const user = await currentUser();
//     if (!user) {
//       return new Response("Unauthorized", { status: 401 });
//     }

//     const { room } = await req.json();

//     const document = await convex.query(api.documents.getById, {
//       id: room as Id<"documents">,
//     });

//     if (!document) {
//       return new Response("Unauthorized", { status: 401 });
//     }

//     // OWNER CHECK
//     if (document.ownerId === user.id) {
//       return authorize(room, user);
//     }

//     // ORG CHECK (safe)
//     if (document.organizationId) {
//       const clerk = clerkClient();

//       const memberships = await (
//         await clerk
//       ).organizations.getOrganizationMembershipList({
//         organizationId: document.organizationId,
//       });

//       const isMember = memberships.data.some(
//         (m) => m.publicUserData?.userId === user.id
//       );

//       if (isMember) {
//         return authorize(room, user);
//       }
//     }

//     return new Response("Unauthorized", { status: 401 });
//   } catch (err) {
//     console.error("LIVEBLOCKS AUTH ERROR:", err);
//     return new Response("Internal error", { status: 500 });
//   }
// }

// function authorize(room: string, user: any | unknown) {
//   const session = liveblocks.prepareSession(user.id, {
//     userInfo: {
//       name:
//         user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous",
//       avatar: user.imageUrl,
//     },
//   });

//   session.allow(room, session.FULL_ACCESS);
//   return session.authorize().then(({ body, status }) => {
//     return new Response(body, { status });
//   });
// }
