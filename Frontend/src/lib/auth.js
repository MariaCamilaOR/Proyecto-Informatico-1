import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
let currentUser = null;
let idToken = null;
onAuthStateChanged(auth, async (u) => {
    currentUser = u;
    idToken = u ? await u.getIdToken(true) : null;
});
export async function getIdToken() {
    if (currentUser)
        idToken = await currentUser.getIdToken(true);
    return idToken;
}
export function getClaims() {
    // Nota: claims custom llegan en el IdToken; se pueden consultar desde backend
    return null;
}
