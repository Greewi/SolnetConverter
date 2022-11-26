import fs from 'fs-extra';

/**
 * @param source the file path file to load
 * @returns resolves the content of the file as a string
 */
export const readFile = async (source: string): Promise<string> => {
    return await fs.readFile(source, "utf8");
}

/**
 * Write a file
 * @param data the content to write
 * @param dest the file path file to write
 */
export const writeFile = async (data: string, dest: string): Promise<void> => {
    return await fs.writeFile(dest, data, "utf8");
};

/**
 * Create a path (recusrively create sub path)
 * @param path the path to create
 */
export const mkdir = async (path: string): Promise<void> => {
    return await fs.mkdir(path, { recursive: true });
};

/**
 * Erase the content of a directory (USE WITH CARE !)
 * @param path le chemin du répertoire à vider
 */
export const emptyDir = async (path: string): Promise<void> => {
    return await fs.emptyDir(path);
};

/**
 * Delete a file
 * @param path the file path to delete
 */
export const remove = async (path: string): Promise<void> => {
    return await fs.remove(path);
};

/**
 * Copy a file
 * @param source the source path
 * @param dest the destination path
 */
export const copy = async (source: string, dest: string): Promise<any> => {
    return await fs.copyFile(source, dest);
};

/**
 * Check if a file exists
 * @returns true if the file exists
 */
export const fileExists = (path: string): boolean => {
    return fs.existsSync(path);
};
