import RAW_DATA from "./data.json";

interface ResourceTypeMetadata {
    label: string;
    color: string;
}

export interface ResourceType extends ResourceTypeMetadata {
    value: string;
}

interface ResourceTagMetadata {
    color: string;
}

export interface Resource {
    url: string;
    type: string;
    description: string;
    details: string | null;
    tags: Array<string>;
}

const RESOURCE_TYPES: Record<string, ResourceTypeMetadata> = {
    tool: {
        label: "Tool",
        color: "#c6878f"
    },
    platform: {
        label: "Platform",
        color: "#969696"
    },
    repository: {
        label: "Repository",
        color: "#67697c"
    },
    article: {
        label: "Article",
        color: "#253d5b"
    },
    book: {
        label: "Book",
        color: "#564d65"
    },
    library: {
        label: "Library",
        color: "#b79d94"
    },
    document: {
        label: "Document (spreadsheet, etc.)",
        color: "#0d5d56"
    },
    newsletter: {
        label: "Newletter",
        color: "TODO"
    },
    newspaper: {
        label: "Newspaper",
        color: "TODO"
    },
    wiki: {
        label: "Wiki",
        color: "TODO"
    },
    blog: {
        label: "Blog",
        color: "TODO"
    },
    company: {
        label: "Company",
        color: "TODO"
    },
    twitter_thread: {
        label: "Twitter Thread",
        color: "TODO"
    }
};

function recordToArray<RecordKey extends string | number | symbol, RecordValue extends {}, NewKey extends string>(record: Record<RecordKey, RecordValue>, keyPropertyName: NewKey): Array<RecordValue & {[key in NewKey]: RecordKey}> {
    const arr: Array<RecordValue & {[key in NewKey]: RecordKey}> = [];
    let key: RecordKey;
    for (key in record) {
        arr.push({
            ...record[key],
            [keyPropertyName]: key
        } as any); // Sad I couldn't make it work without an ugly cast :(
    }
    return arr;
}

export const RESOURCE_TYPES_ARRAY: Array<ResourceType> = recordToArray(RESOURCE_TYPES, "value");

const RESOURCE_TAGS: Record<string, ResourceTagMetadata> = {
    evm: {
        color: "#27428B"
    },
    security: {
        color: "#6676A4"
    },
    ctf: {
        color: "#192856"
    }
};

const DEFAULT_TAG_METADATA: ResourceTagMetadata = {
    color: "#8A5F56"
};

export function getColorOfTag(tag: string): string {
    return (RESOURCE_TAGS[tag] || DEFAULT_TAG_METADATA).color;
}

export function getLabelOfType(type: string): string {
    return RESOURCE_TYPES[type].label;
}

export function getColorOfType(type: string): string {
    return RESOURCE_TYPES[type].color;
}

const RESOURCES: Array<Resource> = RAW_DATA;

export const ALL_TAGS: Array<string> = Array.from(new Set(RESOURCES.map((r: Resource) => r.tags).flat()));

export default RESOURCES;
