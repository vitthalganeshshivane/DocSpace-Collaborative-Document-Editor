"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function getDocuments(ids: Id<"documents">[]) {
  return await convex.query(api.documents.getByIds, { ids });
}

export async function getUsers() {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const clerk = clerkClient();
  const map = new Map<string, any>();

  // ✅ ALWAYS include current user
  const me = await (await clerk).users.getUser(userId);
  map.set(me.id, {
    id: me.id,
    name: me.fullName ?? me.primaryEmailAddress?.emailAddress ?? "Anonymous",
    avatar: me.imageUrl,
  });

  // ✅ Include org users if org exists
  if (sessionClaims?.org_id) {
    const orgUsers = await (
      await clerk
    ).users.getUserList({
      organizationId: [sessionClaims.org_id],
    });

    orgUsers.data.forEach((user) => {
      map.set(user.id, {
        id: user.id,
        name:
          user.fullName ??
          user.primaryEmailAddress?.emailAddress ??
          "Anonymous",
        avatar: user.imageUrl,
      });
    });
  }

  return Array.from(map.values());
}

// "use server";

// import { auth, clerkClient } from "@clerk/nextjs/server";

// export async function getUsers() {
//   const { sessionClaims } = await auth();
//   const clerk = await clerkClient();

//   const response = await clerk.users.getUserList({
//     organizationId: [sessionClaims?.org_id as string],
//   });

//   const users = response.data.map((user) => ({
//     id: user.id,
//     name:
//       user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous",
//     avatar: user.imageUrl,
//   }));

//   return users;
// }

// export async function getUsers() {
//   const { sessionClaims } = await auth();
//   if (!sessionClaims?.sub) {
//     throw new Error("No authenticated user");
//   }

//   const clerk = await clerkClient();

//   // PERSONAL ACCOUNT (no org)
//   if (!sessionClaims.org_id) {
//     const me = await clerk.users.getUser(sessionClaims.sub);

//     return [
//       {
//         id: me.id,
//         name:
//           me.fullName ?? me.primaryEmailAddress?.emailAddress ?? "Anonymous",
//         avatar: me.imageUrl,
//       },
//     ];
//   }

//   // ORGANIZATION USERS
//   const response = await clerk.users.getUserList({
//     organizationId: [sessionClaims.org_id],
//   });

//   return response.data.map((user) => ({
//     id: user.id,
//     name:
//       user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Anonymous",
//     avatar: user.imageUrl,
//   }));
// }
