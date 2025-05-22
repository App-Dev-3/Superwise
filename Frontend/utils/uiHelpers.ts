import { createAvatar } from "@dicebear/core";
import { initials } from "@dicebear/collection";

export const getPlaceholderImage = (fName: string, lName: string): string => {
    if (!fName || !lName || fName.length < 1 || lName.length < 1) {
        return createAvatar(initials, {
            seed: "",
            backgroundType: ["gradientLinear", "solid"]
        }).toDataUri()
    }
    let inits = "";
    inits += fName[0]
    inits += lName[0]

    return createAvatar(initials, {
        seed: inits,
        backgroundType: ["gradientLinear", "solid"],
    }).toDataUri()
}

export const formatTimeString = (isoString: string, locale: string | undefined): string => {
    const d = new Date(isoString)
    return d.toLocaleTimeString(
        locale, // undefined -> uses the user's locale
        { hour: '2-digit', minute: '2-digit' }
    )
}