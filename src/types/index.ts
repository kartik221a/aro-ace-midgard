
// Enums/Constants
export const GENDER_OPTIONS = ["agender", "bigender", "male", "female", "feminine", "gender fluid", "non-binary"];
export const PRONOUN_OPTIONS = ["he/him/his", "she/her/hers", "they/them/theirs", "it/its", "other"];
export const INTENT_OPTIONS = ["friends", "relationship", "both"] as const;

export type IntroductionStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "admin";

export interface UserData {
    uid: string;
    email: string;
    displayName: string;
    username?: string;
    role: UserRole;
    isBanned?: boolean;
    banReason?: string;
    createdAt: any;
}

export interface ImageSection {
    profileUrl?: string; // Main profile image
    coverUrl?: string;   // Background cover image
    gallery: string[];   // Additional images (max 4 additional to main)
}

export interface BasicInfo {
    name: string;
    username?: string;
    dob?: string; // ISO Date string
    country?: string;
    gender: string[]; // Multi-select
}

export interface IdentityDetails {
    pronouns?: string;
    ethnicity: string[];
    sexualOrientation: string[];
    romanticOrientation: string[];
    diet?: string;
    build?: string;
    height?: {
        ft: string; // 0-9
        in: string; // 0-11
        cm: number; // calculated
    };
    languages: string[];
}

export interface LookingForCriteria {
    ageRange: [number, number]; // [min, max]
    gender: string[];
}

export interface RelationshipDetails {
    sexDesire?: string;
    romanceDesire?: string;
    longDistance?: string;
    qpr?: string;
    polyamory?: string;
    kids?: string;
    marriage?: string;
}

export interface PartnerPreferences {
    ageRange: [number, number];
    gender: string[];
    sexDesire: string[];
    romanceDesire: string[];
}

export interface LookingForSection {
    intent: "friends" | "relationship" | "both";
    personal?: RelationshipDetails; // "ME IF IN RELATIONSHIP"
    partner?: PartnerPreferences;   // "MY PREFERENCE FOR A PARTNER"
    friends?: LookingForCriteria;   // "IF FRIENDS"

    // Toggles
    toggles: {
        hasKids: boolean;
        isTaken: boolean;
    }
}

export interface LifestyleSection {
    education?: string;
    occupation?: string;
    alcohol?: string;
    smoke?: string;
    cannabis?: string;
    drugs?: string;
    pets?: string;
    religion?: string;
    politics?: string;
    interests?: string; // Text box
}

export interface LongDescriptionSection {
    id: string; // uuid
    title: string;
    content: string;
}

export interface Introduction {
    uid: string;
    status: IntroductionStatus;

    // Admin fields
    approvedBy?: string; // Admin uid
    rejectedBy?: string; // Admin uid
    rejectionReason?: string;
    adminNotes?: string;
    reviewedAt?: number; // Timestamp

    images: ImageSection;
    basicInfo: BasicInfo;
    identity: IdentityDetails;
    lookingFor: LookingForSection;
    lifestyle: LifestyleSection;
    longDescription: LongDescriptionSection[];

    updatedAt: number; // Timestamp
    createdAt: number; // Timestamp

    // Versioning for moderation
    pendingUpdate?: Partial<Introduction>;
}

export interface Constants {
    // Helper to store option lists if needed dynamically, 
    // but for now we export them as const arrays where needed.
}
