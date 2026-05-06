import { signIn as signInFirebase, loginWithOAuth } from "@/utils/db/servicefirebase-server";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/utils/db/firebase";
import { collection, query, where, getDocs } from "firebase/firestore"; 

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user: any = await signInFirebase(credentials.email);

                if (user) {
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (isPasswordValid) {
                        return {
                            id: user.id,
                            email: user.email,
                            fullname: user.fullname,
                            role: user.role,
                            image: user.image || "/avatar-head.svg",
                        };
                    }
                }
                return null;
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID! || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET! || "",
        }),
    ],

    callbacks: {
       async jwt({ token, account, user, trigger, session }: any) {
            // 1. Logika untuk Login Email/Password (Credentials)
           if (user) {
                token.email = user.email;
                token.fullname = user.fullname;
                token.role = user.role;
                token.image = user.image || "/avatar-head.svg";
            }

            // 2. Logika untuk Login Google (OAuth)
            if (account?.provider === "google") {
                const data = {
                    fullname: user.name,
                    email: user.email,
                    image: user.image,
                    type: "google",
                    role: "Member",
                };

                // Memanggil service firebase untuk simpan/update data user ke DB
                await loginWithOAuth(data, (result: any) => {
                    if (result.status) {
                        token.fullname = result.data.fullname;
                        token.role = result.data.role;
                        token.image = result.data.image;
                    }
                });
            }
            

         // 3. LOGIKA SINKRONISASI (Agar Nama Tidak Balik Lagi)
            if (trigger === "update" && session?.user?.fullname) {
                // Update realtime saat klik tombol simpan
                token.fullname = session.user.fullname;
            } else if (token?.email) {
                // Cari data terbaru ke Firestore berdasarkan field email
                try {
                    const q = query(collection(db, "users"), where("email", "==", token.email));
                    const querySnapshot = await getDocs(q);
                    
                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data();
                        token.fullname = userData.fullname;
                        token.role = userData.role;
                        if (userData.image) token.image = userData.image;
                    }
                } catch (error) {
                    console.error("Gagal sinkronisasi Firestore:", error);
                }
            }
            
            return token;
        },

        async session({ session, token }: any) {
            if (token.email) {
                session.user.email = token.email;
            }
            if (token.fullname) {
                session.user.fullname = token.fullname;
            }
            if (token.image) {
                session.user.image = token.image;
            }
            if (token.role) {
                session.user.role = token.role;
            }
            if (token.type) {
                session.user.type = token.type;
            }
            return session;
        },
    },

    pages: {
        signIn: "/auth/login",
    },
};

export default NextAuth(authOptions);