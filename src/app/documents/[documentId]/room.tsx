"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useParams } from "next/navigation";
import { FullscreenLoader } from "@/components/fullscreen-loader";
import { getUsers, getDocuments } from "./actions";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";

type User = {
  id: string;
  name: string;
  avatar: string;
};

export function Room({ children }: { children: ReactNode }) {
  const params = useParams();
  const documentId = params.documentId as string;

  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = useMemo(
    () => async () => {
      try {
        const list = await getUsers();
        setUsers(list);
      } catch {
        toast.error("Failed to fetch users");
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  return (
    <LiveblocksProvider
      throttle={16}
      authEndpoint={async () => {
        const response = await fetch("/api/liveblocks-auth", {
          method: "POST",
          body: JSON.stringify({ room: documentId }),
        });

        return await response.json();
      }}
      resolveUsers={({ userIds }) =>
        userIds.map(
          (id) =>
            users.find((u) => u.id === id) ?? {
              id,
              name: "Anonymous",
              avatar: "",
            }
        )
      }
      resolveMentionSuggestions={({ text }) => {
        const filtered = text
          ? users.filter((u) =>
              u.name.toLowerCase().includes(text.toLowerCase())
            )
          : users;

        return filtered.map((u) => u.id);
      }}
      resolveRoomsInfo={async ({ roomIds }) => {
        const documents = await getDocuments(roomIds as Id<"documents">[]);

        // return documents.map((document) => ({
        //   id: document.id,
        //   name: document.name,
        // }));
        return documents.map((document) => ({
          id: document._id,
          name: document.title,
        }));
      }}
    >
      <RoomProvider
        id={documentId}
        initialStorage={{ leftMargin: 56, rightMargin: 56 }}
      >
        <ClientSideSuspense
          fallback={<FullscreenLoader label="Room loading..." />}
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

// "use client";

// import { ReactNode, useEffect, useMemo, useState } from "react";
// import {
//   LiveblocksProvider,
//   RoomProvider,
//   ClientSideSuspense,
// } from "@liveblocks/react/suspense";
// import { useParams } from "next/navigation";
// import { FullscreenLoader } from "@/components/fullscreen-loader";
// import { getUsers } from "./actions";
// import { toast } from "sonner";

// type User = { id: string; name: string; avatar: string };

// export function Room({ children }: { children: ReactNode }) {
//   const params = useParams();
//   const { documentId } = params;

//   const [users, setUsers] = useState<User[]>([]);

//   const fetchUsers = useMemo(
//     () => async () => {
//       try {
//         const list = await getUsers();
//         setUsers(list);
//       } catch {
//         toast.error("Failed to fetch the users");
//       }
//     },
//     []
//   );

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   return (
//     <LiveblocksProvider
//       throttle={16}
//       authEndpoint={async () => {
//         const endpoint = `/api/liveblocks-auth`;
//         const room = params.documentId as string;

//         const response = await fetch(endpoint, {
//           method: "POST",
//           body: JSON.stringify({ room }),
//         });

//         return await response.json();
//       }}
//       resolveUsers={({ userIds }) => {
//         return userIds.map(
//           (userId) => users.find((user) => user.id === userId) ?? undefined
//         );
//       }}
//       // resolveUsers={({ userIds }) => {
//       //   return userIds.map((userId) => {
//       //     const user = users.find((u) => u.id === userId);
//       //     return (
//       //       user ?? {
//       //         id: userId,
//       //         name: "Anonymous",
//       //         avatar: "",
//       //       }
//       //     );
//       //   });
//       // }}
//       resolveMentionSuggestions={({ text }) => {
//         let filteredUsers = users;

//         if (text) {
//           filteredUsers = users.filter((user) =>
//             user.name.toLowerCase().includes(text.toLowerCase())
//           );
//         }

//         return filteredUsers.map((user) => user.id);
//       }}
//       resolveRoomsInfo={() => []}
//     >
//       <RoomProvider id={documentId as string}>
//         <ClientSideSuspense
//           fallback={<FullscreenLoader label="Room Loading...." />}
//         >
//           {children}
//         </ClientSideSuspense>
//       </RoomProvider>
//     </LiveblocksProvider>
//   );
// }
