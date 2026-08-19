export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          achievement_value: number | null
          created_at: string
          id: string
          unlocked_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          achievement_value?: number | null
          created_at?: string
          id?: string
          unlocked_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_type?: Database["public"]["Enums"]["achievement_type"]
          achievement_value?: number | null
          created_at?: string
          id?: string
          unlocked_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_migrations: {
        Row: {
          applied_at: string
          filename: string
        }
        Insert: {
          applied_at?: string
          filename: string
        }
        Update: {
          applied_at?: string
          filename?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          error_msg: string | null
          id: number
          params: Json | null
          result: string | null
          tx_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_msg?: string | null
          id?: number
          params?: Json | null
          result?: string | null
          tx_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_msg?: string | null
          id?: number
          params?: Json | null
          result?: string | null
          tx_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_occurrences: {
        Row: {
          checkin_date: string | null
          checkin_record_id: string | null
          created_at: string
          deadline_at: string
          id: string
          makeup_usage_id: string | null
          penalty_capped_amount: number | null
          penalty_transaction_id: string | null
          period_end: string
          period_start: string
          project_id: string
          status: Database["public"]["Enums"]["occurrence_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_date?: string | null
          checkin_record_id?: string | null
          created_at?: string
          deadline_at: string
          id?: string
          makeup_usage_id?: string | null
          penalty_capped_amount?: number | null
          penalty_transaction_id?: string | null
          period_end: string
          period_start: string
          project_id: string
          status?: Database["public"]["Enums"]["occurrence_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_date?: string | null
          checkin_record_id?: string | null
          created_at?: string
          deadline_at?: string
          id?: string
          makeup_usage_id?: string | null
          penalty_capped_amount?: number | null
          penalty_transaction_id?: string | null
          period_end?: string
          period_start?: string
          project_id?: string
          status?: Database["public"]["Enums"]["occurrence_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_occurrences_checkin_record_id_fkey"
            columns: ["checkin_record_id"]
            isOneToOne: false
            referencedRelation: "checkin_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_occurrences_makeup_usage_id_fkey"
            columns: ["makeup_usage_id"]
            isOneToOne: false
            referencedRelation: "makeup_usages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_occurrences_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "checkin_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_occurrences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_occurrences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_projects: {
        Row: {
          archived_at: string | null
          checkin_mode: Database["public"]["Enums"]["checkin_mode_type"] | null
          color: string | null
          created_at: string
          current_progress: number
          current_streak: number
          deadline_time: string
          deleted_at: string | null
          frequency: Database["public"]["Enums"]["project_frequency_type"]
          frequency_config: Json | null
          icon: string | null
          id: string
          makeup_count: number
          makeup_reward_mode: Database["public"]["Enums"]["makeup_reward_mode_type"]
          makeup_reward_ratio: number | null
          makeup_type: Database["public"]["Enums"]["makeup_type"]
          makeup_validity_days: number
          max_members: number
          max_streak: number
          name: string
          owner_id: string
          penalty_amount: number
          project_type: Database["public"]["Enums"]["project_type"]
          reminder_time: string | null
          reward_amount: number
          reward_amount_per_settlement: number
          reward_mode: Database["public"]["Enums"]["reward_mode_type"]
          reward_n_value: number | null
          reward_pool: number | null
          reward_pool_lifetime_budget: number | null
          reward_remainder_recipient_id: string | null
          shared_makeup_remaining: number | null
          starts_at: string
          status: Database["public"]["Enums"]["project_status"]
          target_count: number | null
          target_description: string | null
          task_type: Database["public"]["Enums"]["task_type"]
          timezone: string
          updated_at: string
          visibility: Database["public"]["Enums"]["project_visibility"]
        }
        Insert: {
          archived_at?: string | null
          checkin_mode?: Database["public"]["Enums"]["checkin_mode_type"] | null
          color?: string | null
          created_at?: string
          current_progress?: number
          current_streak?: number
          deadline_time?: string
          deleted_at?: string | null
          frequency?: Database["public"]["Enums"]["project_frequency_type"]
          frequency_config?: Json | null
          icon?: string | null
          id?: string
          makeup_count?: number
          makeup_reward_mode?: Database["public"]["Enums"]["makeup_reward_mode_type"]
          makeup_reward_ratio?: number | null
          makeup_type?: Database["public"]["Enums"]["makeup_type"]
          makeup_validity_days?: number
          max_members?: number
          max_streak?: number
          name: string
          owner_id: string
          penalty_amount?: number
          project_type?: Database["public"]["Enums"]["project_type"]
          reminder_time?: string | null
          reward_amount?: number
          reward_amount_per_settlement?: number
          reward_mode?: Database["public"]["Enums"]["reward_mode_type"]
          reward_n_value?: number | null
          reward_pool?: number | null
          reward_pool_lifetime_budget?: number | null
          reward_remainder_recipient_id?: string | null
          shared_makeup_remaining?: number | null
          starts_at?: string
          status?: Database["public"]["Enums"]["project_status"]
          target_count?: number | null
          target_description?: string | null
          task_type?: Database["public"]["Enums"]["task_type"]
          timezone?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["project_visibility"]
        }
        Update: {
          archived_at?: string | null
          checkin_mode?: Database["public"]["Enums"]["checkin_mode_type"] | null
          color?: string | null
          created_at?: string
          current_progress?: number
          current_streak?: number
          deadline_time?: string
          deleted_at?: string | null
          frequency?: Database["public"]["Enums"]["project_frequency_type"]
          frequency_config?: Json | null
          icon?: string | null
          id?: string
          makeup_count?: number
          makeup_reward_mode?: Database["public"]["Enums"]["makeup_reward_mode_type"]
          makeup_reward_ratio?: number | null
          makeup_type?: Database["public"]["Enums"]["makeup_type"]
          makeup_validity_days?: number
          max_members?: number
          max_streak?: number
          name?: string
          owner_id?: string
          penalty_amount?: number
          project_type?: Database["public"]["Enums"]["project_type"]
          reminder_time?: string | null
          reward_amount?: number
          reward_amount_per_settlement?: number
          reward_mode?: Database["public"]["Enums"]["reward_mode_type"]
          reward_n_value?: number | null
          reward_pool?: number | null
          reward_pool_lifetime_budget?: number | null
          reward_remainder_recipient_id?: string | null
          shared_makeup_remaining?: number | null
          starts_at?: string
          status?: Database["public"]["Enums"]["project_status"]
          target_count?: number | null
          target_description?: string | null
          task_type?: Database["public"]["Enums"]["task_type"]
          timezone?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["project_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "checkin_projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_projects_reward_remainder_recipient_id_fkey"
            columns: ["reward_remainder_recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_projects_reward_remainder_recipient_id_fkey"
            columns: ["reward_remainder_recipient_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_records: {
        Row: {
          attempt_no: number
          checked_at: string
          checkin_date: string
          created_at: string
          id: string
          is_makeup: boolean
          makeuped_at: string | null
          note: string | null
          photo: string | null
          project_id: string
          revoked_at: string | null
          reward_earned: number
          reward_mode_snapshot:
            | Database["public"]["Enums"]["reward_mode_type"]
            | null
          status: Database["public"]["Enums"]["checkin_attempt_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_no?: number
          checked_at?: string
          checkin_date: string
          created_at?: string
          id?: string
          is_makeup?: boolean
          makeuped_at?: string | null
          note?: string | null
          photo?: string | null
          project_id: string
          revoked_at?: string | null
          reward_earned?: number
          reward_mode_snapshot?:
            | Database["public"]["Enums"]["reward_mode_type"]
            | null
          status?: Database["public"]["Enums"]["checkin_attempt_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_no?: number
          checked_at?: string
          checkin_date?: string
          created_at?: string
          id?: string
          is_makeup?: boolean
          makeuped_at?: string | null
          note?: string | null
          photo?: string | null
          project_id?: string
          revoked_at?: string | null
          reward_earned?: number
          reward_mode_snapshot?:
            | Database["public"]["Enums"]["reward_mode_type"]
            | null
          status?: Database["public"]["Enums"]["checkin_attempt_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "checkin_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_records: {
        Row: {
          amount: number
          created_at: string
          id: string
          occurrence_id: string
          project_id: string
          settle_transaction_id: string | null
          settled_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          occurrence_id: string
          project_id: string
          settle_transaction_id?: string | null
          settled_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          occurrence_id?: string
          project_id?: string
          settle_transaction_id?: string | null
          settled_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_records_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "checkin_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "checkin_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          deleted_at: string | null
          expense_date: string
          id: string
          note: string | null
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          expense_date?: string
          id?: string
          note?: string | null
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          expense_date?: string
          id?: string
          note?: string | null
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          requested_by: string
          status: Database["public"]["Enums"]["friendship_status"]
          user_high_id: string
          user_low_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          requested_by: string
          status?: Database["public"]["Enums"]["friendship_status"]
          user_high_id: string
          user_low_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          requested_by?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          user_high_id?: string
          user_low_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_friendships_requested_by"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_friendships_requested_by"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_friendships_user_high"
            columns: ["user_high_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_friendships_user_high"
            columns: ["user_high_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_friendships_user_low"
            columns: ["user_low_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_friendships_user_low"
            columns: ["user_low_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      makeup_usages: {
        Row: {
          checkin_record_id: string | null
          created_at: string
          id: string
          makeup_type: Database["public"]["Enums"]["makeup_type_enum"]
          occurrence_id: string
          project_id: string
          reward_transaction_id: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          checkin_record_id?: string | null
          created_at?: string
          id?: string
          makeup_type: Database["public"]["Enums"]["makeup_type_enum"]
          occurrence_id: string
          project_id: string
          reward_transaction_id?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          checkin_record_id?: string | null
          created_at?: string
          id?: string
          makeup_type?: Database["public"]["Enums"]["makeup_type_enum"]
          occurrence_id?: string
          project_id?: string
          reward_transaction_id?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "makeup_usages_checkin_record_id_fkey"
            columns: ["checkin_record_id"]
            isOneToOne: false
            referencedRelation: "checkin_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "makeup_usages_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "checkin_occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "makeup_usages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "checkin_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "makeup_usages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "makeup_usages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          deleted_at: string | null
          id: string
          nickname: string
          profile_visibility: Database["public"]["Enums"]["project_visibility"]
          timezone: string
          total_earned: number
          total_penalty: number
          total_revoked: number
          total_spent: number
          updated_at: string
          wallet_balance: number
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          deleted_at?: string | null
          id: string
          nickname: string
          profile_visibility?: Database["public"]["Enums"]["project_visibility"]
          timezone?: string
          total_earned?: number
          total_penalty?: number
          total_revoked?: number
          total_spent?: number
          updated_at?: string
          wallet_balance?: number
        }
        Update: {
          avatar?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          nickname?: string
          profile_visibility?: Database["public"]["Enums"]["project_visibility"]
          timezone?: string
          total_earned?: number
          total_penalty?: number
          total_revoked?: number
          total_spent?: number
          updated_at?: string
          wallet_balance?: number
        }
        Relationships: []
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string | null
          makeup_used: number
          project_id: string
          quit_at: string | null
          role: Database["public"]["Enums"]["member_role"]
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          makeup_used?: number
          project_id: string
          quit_at?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          makeup_used?: number
          project_id?: string
          quit_at?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "checkin_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          project_id: string
          reason: string
          revoke_transaction_id: string | null
          revoked_at: string | null
          reward_transaction_id: string
          source_id: string
          source_type: string
          trigger_checkin_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          project_id: string
          reason: string
          revoke_transaction_id?: string | null
          revoked_at?: string | null
          reward_transaction_id: string
          source_id: string
          source_type: string
          trigger_checkin_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          project_id?: string
          reason?: string
          revoke_transaction_id?: string | null
          revoked_at?: string | null
          reward_transaction_id?: string
          source_id?: string
          source_type?: string
          trigger_checkin_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "checkin_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_events_trigger_checkin_id_fkey"
            columns: ["trigger_checkin_id"]
            isOneToOne: false
            referencedRelation: "checkin_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_settlements: {
        Row: {
          allocations: Json
          created_at: string
          id: string
          member_count: number
          milestone_no: number | null
          owner_bonus: number
          per_member_amount: number
          project_id: string
          reward_transaction_ids: string[] | null
          settlement_key: string
          settlement_round: number
          settlement_type: Database["public"]["Enums"]["settlement_type_enum"]
          total_pool: number
          trigger_date: string | null
        }
        Insert: {
          allocations: Json
          created_at?: string
          id?: string
          member_count: number
          milestone_no?: number | null
          owner_bonus?: number
          per_member_amount: number
          project_id: string
          reward_transaction_ids?: string[] | null
          settlement_key: string
          settlement_round: number
          settlement_type: Database["public"]["Enums"]["settlement_type_enum"]
          total_pool: number
          trigger_date?: string | null
        }
        Update: {
          allocations?: Json
          created_at?: string
          id?: string
          member_count?: number
          milestone_no?: number | null
          owner_bonus?: number
          per_member_amount?: number
          project_id?: string
          reward_transaction_ids?: string[] | null
          settlement_key?: string
          settlement_round?: number
          settlement_type?: Database["public"]["Enums"]["settlement_type_enum"]
          total_pool?: number
          trigger_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_settlements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "checkin_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          idempotency_key: string | null
          reason: string | null
          related_checkin_id: string | null
          related_expense_id: string | null
          related_project_id: string | null
          sequence_no: number
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          idempotency_key?: string | null
          reason?: string | null
          related_checkin_id?: string | null
          related_expense_id?: string | null
          related_project_id?: string | null
          sequence_no?: number
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          idempotency_key?: string | null
          reason?: string | null
          related_checkin_id?: string | null
          related_expense_id?: string | null
          related_project_id?: string | null
          sequence_no?: number
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_related_checkin_id_fkey"
            columns: ["related_checkin_id"]
            isOneToOne: false
            referencedRelation: "checkin_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_related_project_id_fkey"
            columns: ["related_project_id"]
            isOneToOne: false
            referencedRelation: "checkin_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_visible_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_visible_profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          id: string | null
          nickname: string | null
          profile_visibility:
            | Database["public"]["Enums"]["project_visibility"]
            | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          id?: string | null
          nickname?: string | null
          profile_visibility?:
            | Database["public"]["Enums"]["project_visibility"]
            | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          id?: string | null
          nickname?: string | null
          profile_visibility?:
            | Database["public"]["Enums"]["project_visibility"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      _grant_reward_internal: {
        Args: {
          p_amount: number
          p_idem_key?: string
          p_project_id: string
          p_reason?: string
          p_source_id?: string
          p_source_type?: string
          p_user_id: string
        }
        Returns: string
      }
      _insert_transaction: {
        Args: {
          p_amount: number
          p_description?: string
          p_idempotency_key?: string
          p_reason?: string
          p_related_checkin_id?: string
          p_related_expense_id?: string
          p_related_project_id?: string
          p_transaction_type: Database["public"]["Enums"]["transaction_type"]
          p_user_id: string
        }
        Returns: string
      }
      _penalize_any_one_mode_internal: {
        Args: {
          p_description?: string
          p_penalty: number
          p_project_id: string
          p_target_date: string
        }
        Returns: {
          tx_id: string
          user_id: string
        }[]
      }
      _penalize_user_internal: {
        Args: {
          p_amount: number
          p_description?: string
          p_period_key: string
          p_project_id: string
          p_user_id: string
        }
        Returns: string
      }
      _recalc_streak_internal: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: undefined
      }
      accept_friendship: {
        Args: { p_friendship_id: string }
        Returns: undefined
      }
      accept_invitation: { Args: { p_project_id: string }; Returns: undefined }
      can_access_project: { Args: { p_project_id: string }; Returns: boolean }
      can_view_profile: { Args: { p_profile_id: string }; Returns: boolean }
      can_view_project_activity: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      cancel_project: { Args: { p_project_id: string }; Returns: undefined }
      cancel_project_invitation: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: undefined
      }
      create_checkin: {
        Args: { p_note?: string; p_photo?: string; p_project_id: string }
        Returns: string
      }
      create_project: {
        Args: {
          p_checkin_mode?: Database["public"]["Enums"]["checkin_mode_type"]
          p_deadline_time?: string
          p_description?: string
          p_frequency: Database["public"]["Enums"]["project_frequency_type"]
          p_makeup_count?: number
          p_makeup_reward_mode?: Database["public"]["Enums"]["makeup_reward_mode_type"]
          p_makeup_reward_ratio?: number
          p_makeup_type?: Database["public"]["Enums"]["makeup_type"]
          p_makeup_validity_days?: number
          p_name: string
          p_penalty_amount?: number
          p_project_type: Database["public"]["Enums"]["project_type"]
          p_reminder_time?: string
          p_reward_amount: number
          p_reward_mode?: Database["public"]["Enums"]["reward_mode_type"]
          p_starts_at?: string
          p_timezone?: string
          p_visibility?: Database["public"]["Enums"]["project_visibility"]
        }
        Returns: string
      }
      cron_activate_pending_projects: {
        Args: never
        Returns: {
          project_id: string
        }[]
      }
      cron_generate_today_occurrences: {
        Args: never
        Returns: {
          out_occurrence_id: string
          out_project_id: string
          out_user_id: string
        }[]
      }
      cron_process_missed_occurrences: {
        Args: never
        Returns: {
          final_status: string
          occurrence_id: string
        }[]
      }
      current_user_id: { Args: never; Returns: string }
      dearmor: { Args: { "": string }; Returns: string }
      delete_expense: { Args: { p_expense_id: string }; Returns: undefined }
      delete_friendship: {
        Args: { p_friendship_id: string }
        Returns: undefined
      }
      gen_random_uuid: { Args: never; Returns: string }
      gen_salt: { Args: { "": string }; Returns: string }
      get_friend_leaderboard: {
        Args: never
        Returns: {
          avatar: string
          nickname: string
          total_earned: number
          total_spent: number
          user_id: string
          wallet_balance: number
        }[]
      }
      get_last_balance: { Args: { p_user_id: string }; Returns: number }
      get_my_checkin_activity: {
        Args: { p_project_id: string }
        Returns: {
          checked_at: string
          checkin_date: string
          id: string
          is_makeup: boolean
          project_id: string
          status: Database["public"]["Enums"]["checkin_attempt_status"]
          user_id: string
        }[]
      }
      get_my_month_summary: {
        Args: { p_month_start: string }
        Returns: {
          month_earned: number
          month_spent: number
        }[]
      }
      get_my_obligation_start: {
        Args: { p_project_id: string }
        Returns: string
      }
      get_my_profile: {
        Args: never
        Returns: {
          avatar: string
          created_at: string
          id: string
          nickname: string
          profile_visibility: Database["public"]["Enums"]["project_visibility"]
          timezone: string
          total_earned: number
          total_penalty: number
          total_revoked: number
          total_spent: number
          updated_at: string
          wallet_balance: number
        }[]
      }
      get_my_project_invitations: {
        Args: never
        Returns: {
          color: string
          icon: string
          invited_by: string
          membership_id: string
          name: string
          owner_id: string
          project_id: string
          project_status: Database["public"]["Enums"]["project_status"]
          starts_at: string
          target_description: string
        }[]
      }
      get_my_team_leaderboard: {
        Args: never
        Returns: {
          member_count: number
          project_color: string
          project_icon: string
          project_id: string
          project_name: string
          team_balance: number
        }[]
      }
      get_today_checkin_status: {
        Args: never
        Returns: {
          checked_at: string
          checkin_id: string
          deadline_at: string
          project_id: string
          reward_amount: number
          reward_earned: number
          reward_mode: Database["public"]["Enums"]["reward_mode_type"]
          reward_n_value: number
          today: string
        }[]
      }
      get_user_today: { Args: { p_user_id: string }; Returns: string }
      get_visible_checkin_activity: {
        Args: { p_project_id: string }
        Returns: {
          checked_at: string
          checkin_date: string
          id: string
          is_makeup: boolean
          project_id: string
          status: Database["public"]["Enums"]["checkin_attempt_status"]
          user_id: string
        }[]
      }
      get_visible_project_summaries: {
        Args: never
        Returns: {
          color: string
          current_streak: number
          icon: string
          id: string
          max_streak: number
          name: string
          owner_id: string
          project_type: Database["public"]["Enums"]["project_type"]
          starts_at: string
          status: Database["public"]["Enums"]["project_status"]
          target_description: string
          visibility: Database["public"]["Enums"]["project_visibility"]
        }[]
      }
      invite_project_member: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: string
      }
      is_project_owner: { Args: { p_project_id: string }; Returns: boolean }
      patch_project_details: {
        Args: { p_patch: Json; p_project_id: string }
        Returns: undefined
      }
      pgp_armor_headers: {
        Args: { "": string }
        Returns: Record<string, unknown>[]
      }
      quit_project: { Args: { p_project_id: string }; Returns: undefined }
      record_expense: {
        Args: {
          p_amount: number
          p_category?: string
          p_expense_date?: string
          p_note?: string
          p_request_id?: string
        }
        Returns: string
      }
      reject_friendship: {
        Args: { p_friendship_id: string }
        Returns: undefined
      }
      reject_project_invitation: {
        Args: { p_project_id: string }
        Returns: undefined
      }
      remove_project_member: {
        Args: { p_project_id: string; p_user_id: string }
        Returns: undefined
      }
      request_friendship: { Args: { p_target_id: string }; Returns: string }
      revoke_checkin: {
        Args: { p_checkin_id: string; p_reason?: string }
        Returns: undefined
      }
      update_expense: {
        Args: {
          p_category?: string
          p_expense_date?: string
          p_expense_id: string
          p_new_amount: number
          p_note?: string
        }
        Returns: undefined
      }
      update_profile: {
        Args: { p_avatar?: string; p_nickname?: string; p_timezone?: string }
        Returns: undefined
      }
      update_profile_visibility: {
        Args: {
          p_visibility: Database["public"]["Enums"]["project_visibility"]
        }
        Returns: undefined
      }
      uuid_generate_v1: { Args: never; Returns: string }
      uuid_generate_v1mc: { Args: never; Returns: string }
      uuid_generate_v3: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_generate_v4: { Args: never; Returns: string }
      uuid_generate_v5: {
        Args: { name: string; namespace: string }
        Returns: string
      }
      uuid_nil: { Args: never; Returns: string }
      uuid_ns_dns: { Args: never; Returns: string }
      uuid_ns_oid: { Args: never; Returns: string }
      uuid_ns_url: { Args: never; Returns: string }
      uuid_ns_x500: { Args: never; Returns: string }
    }
    Enums: {
      achievement_type: "streak" | "badge" | "level"
      checkin_attempt_status: "active" | "revoked"
      checkin_mode_type: "any_one" | "all"
      friendship_status: "pending" | "accepted"
      makeup_reward_mode_type: "none" | "full" | "partial"
      makeup_type: "independent" | "shared"
      makeup_type_enum: "independent" | "shared"
      member_role: "owner" | "admin" | "member"
      member_status: "pending" | "active" | "quit" | "removed" | "expired"
      occurrence_status:
        | "pending"
        | "checked"
        | "missed"
        | "makeup"
        | "revoked"
        | "exempted"
        | "penalty_capped"
      project_frequency_type: "daily" | "weekly" | "custom"
      project_status: "pending" | "active" | "cancelled" | "archived"
      project_type: "personal" | "group"
      project_visibility: "private" | "friends" | "public"
      reward_mode_type: "every_time" | "every_n" | "completed"
      settlement_type_enum: "daily" | "milestone" | "completion"
      task_type: "infinite" | "finite"
      transaction_type:
        | "reward"
        | "penalty"
        | "expense"
        | "adjustment"
        | "revoke"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      achievement_type: ["streak", "badge", "level"],
      checkin_attempt_status: ["active", "revoked"],
      checkin_mode_type: ["any_one", "all"],
      friendship_status: ["pending", "accepted"],
      makeup_reward_mode_type: ["none", "full", "partial"],
      makeup_type: ["independent", "shared"],
      makeup_type_enum: ["independent", "shared"],
      member_role: ["owner", "admin", "member"],
      member_status: ["pending", "active", "quit", "removed", "expired"],
      occurrence_status: [
        "pending",
        "checked",
        "missed",
        "makeup",
        "revoked",
        "exempted",
        "penalty_capped",
      ],
      project_frequency_type: ["daily", "weekly", "custom"],
      project_status: ["pending", "active", "cancelled", "archived"],
      project_type: ["personal", "group"],
      project_visibility: ["private", "friends", "public"],
      reward_mode_type: ["every_time", "every_n", "completed"],
      settlement_type_enum: ["daily", "milestone", "completion"],
      task_type: ["infinite", "finite"],
      transaction_type: [
        "reward",
        "penalty",
        "expense",
        "adjustment",
        "revoke",
      ],
    },
  },
} as const

