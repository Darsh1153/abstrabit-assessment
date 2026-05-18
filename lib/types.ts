export type Bookmark = {
  id: string;
  user_id: string;
  url: string;
  title: string;
  tags: string[];
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: Bookmark;
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          title: string;
          tags?: string[];
          created_at?: string;
        };
        Update: Partial<{
          url: string;
          title: string;
          tags: string[];
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
