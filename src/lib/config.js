import Dexie from 'dexie';
import { create } from 'zustand';
import { Toast } from '@capacitor/toast';
import { persist } from 'zustand/middleware';
import { Filesystem } from '@capacitor/filesystem';

const db = new Dexie('DictionaryDatabase');
db.version(1).stores({
    entries: '++id, &word',
});
const useFileStore = create((set) => ({
    activeFile: null,
    openFile: (file) => {
        set({
            activeFile: file
        });
    },
}));
const usePersistFileStore = create(
    persist(
        (set) => ({
            files: [],
            saveFile: (file) => set((state) => ({ files: [...state.files, file] })),
        }),
        {
            name: 'file-storage',
            storage: {
                getItem: async (name) => {
                    const { value } = await Filesystem.readFile({ path: name, directory: Filesystem.Directory.Data });
                    return JSON.parse(value);
                },
                setItem: async (name, value) => {
                    await Filesystem.writeFile({
                        path: name,
                        data: JSON.stringify(value),
                        directory: Filesystem.Directory.Data
                    })
                },
                removeItem: async (name) => {
                    await Filesystem.deleteFile({ path: name, directory: Filesystem.Directory.Data })
                }
            },
            // getStorage: () => localStorage,
        }
    )
)


class Configuration {
    save(key, value) {
        const data = this.getAll();
        data[key] = value;
        localStorage.setItem('config', JSON.stringify(data));
    }
    get(key, alt = null) {
        const data = this.getAll();
        if (data[key]) return data[key];
        else return alt;
    }
    getAll() {
        return JSON.parse(localStorage.getItem('config') || '{}');
    }
    clear() {
        localStorage.setItem('config', JSON.stringify({}));
    }
}

class DictionaryDB {
    async download() {
        try {
            const response = await fetch("https://raw.githubusercontent.com/amanumar32/English-Dictionary-JSON/main/dictionary_alpha_arrays.json");
            const rawData = await response.json();

            const formattedData = rawData.flatMap(obj => {
                return Object.entries(obj).map(([word, definition]) => ({
                    word: word.toLowerCase().trim(),
                    definition: definition
                }));
            });

            await db.transaction('rw', db.entries, async () => {
                await db.entries.clear();
                await db.entries.bulkPut(formattedData);
            });

            return { success: true, message: `Synced ${formattedData.length} words!` };
        } catch (err) {
            console.error(err);
            return { success: false, message: "Storage failed: " + err.message };
        }
    }

    async lookup(input) {
        if (!input) return [];
        const query = input.toLowerCase().trim();

        try {
            return await db.entries
                .where('word')
                .startsWith(query)
                .limit(15)
                .toArray();
        } catch (error) {
            console.error("Lookup Error:", error);
            return [];
        }
    }

    async check() {
        return await db.entries.get({ word: 'apple' }) !== undefined;
    }
}

class FileStore {
    async open(file) {
        const openFile = useFileStore.getState().openFile;
        await openFile(file);
    }
    save(file) {
        const saveFile = usePersistFileStore.getState().saveFile;
        saveFile(file);
    }
    get(persist = false) {
        if (persist) {
            return usePersistFileStore.getState().files;
        } else {
            return useFileStore.getState().activeFile;
        }
    }
}

class Device {
    async toast(message, duration = 'short') {
        await Toast.show({
            text: message,
            duration: duration,
            position: 'bottom',
        });
    };

}



const configuration = new Configuration();
const dictionaryDB = new DictionaryDB();
const fileStore = new FileStore();
const device = new Device();


export {
    dictionaryDB,
    configuration,
    fileStore,
    device
};