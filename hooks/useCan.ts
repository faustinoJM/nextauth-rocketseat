import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

type UseCanParams = {
    permissions?: string[];
    roles?: string[]
}

export function useCan({ permissions, roles }: UseCanParams ) {
    const { user, isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        return false;
    }

    // if (permissions?.length) {
    //     const hasAllPermissions = permissions.every(permission => {
    //         return user.permissions.includes(permission);
    //     });

    //     if (!hasAllPermissions) {
    //         return false;
    //     }
    // }

    // if (roles?.length) {
    //     const hasAllRoles = roles.some(role => {
    //         return user.roles.includes(role);
    //     });

    //     if (!hasAllRoles) {
    //         return false;
    //     }
    // }
    // return true;

    const userHasValidPermissions = validateUserPermissions({
        user, 
        permissions,
        roles
    })

    return userHasValidPermissions;


}
