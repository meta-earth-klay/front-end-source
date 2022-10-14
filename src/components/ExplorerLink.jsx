import { Link } from "@chakra-ui/react";
import { EXPLORER_URL } from "../config";

export default function ExplorerLink({ address, children }) {
    return (
        <Link target="_blank" href={`${EXPLORER_URL}address/${address}`}>{children}</Link>
    )
}