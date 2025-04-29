import {createAvatar} from "@dicebear/core";
import {initials} from "@dicebear/collection";

export const getPlaceholderImage = (fName: string, lName: string) :string => {
    if (!fName || !lName || fName.length < 1 || lName.length < 1) {
        return createAvatar(initials, {
            seed: "",
            backgroundType: ["gradientLinear","solid"]
        }).toDataUri()
    }
    let inits = "";
    inits += fName[0]
    inits += lName[0]

    return createAvatar(initials, {
        seed: inits,
        backgroundType: ["gradientLinear","solid"],
    }).toDataUri()
}