import { auth } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";

let currentUser: User | null = null;
let idToken: string | null = null;

onAuthStateChanged(auth, async (u) => {
  currentUser = u;
  idToken = u ? await u.getIdToken(true) : null;
});

export async function getIdToken(): Promise<string | null> {
  if (currentUser) idToken = await currentUser.getIdToken(true);
  return idToken;
}
export function getClaims(): any | null {
  // Nota: claims custom llegan en el IdToken; se pueden consultar desde backend
  return null;
}