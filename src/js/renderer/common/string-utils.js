export class StringUtils {
    static truncateTextWithEllipsisByLength(str, length) {
        return str.length > length
            ? str.slice(0, length - 3) + "..."
            : str;
    }
}