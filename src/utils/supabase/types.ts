
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "auth": {
          Tables: {
            "audit_log_entries": {
                  Row: {
                    "created_at": string | null,"id": string,"instance_id": string | null,"ip_address": string,"payload": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"id": string,"instance_id"?: string | null,"ip_address"?: string,"payload"?: Json | null
                  }
                  Update: {
                    "created_at"?: string | null,"id"?: string,"instance_id"?: string | null,"ip_address"?: string,"payload"?: Json | null
                  }
                  Relationships: [
                    
                  ]
                },"custom_oauth_providers": {
                  Row: {
                    "acceptable_client_ids": (string)[],"attribute_mapping": NonNullable<Json>,"authorization_params": NonNullable<Json>,"authorization_url": string | null,"cached_discovery": Json | null,"client_id": string,"client_secret": string,"created_at": string,"custom_claims_allowlist": (string)[],"discovery_cached_at": string | null,"discovery_url": string | null,"email_optional": boolean,"enabled": boolean,"id": string,"identifier": string,"issuer": string | null,"jwks_uri": string | null,"name": string,"pkce_enabled": boolean,"provider_type": string,"scopes": (string)[],"skip_nonce_check": boolean,"token_url": string | null,"updated_at": string,"userinfo_url": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "acceptable_client_ids"?: (string)[],"attribute_mapping"?: NonNullable<Json>,"authorization_params"?: NonNullable<Json>,"authorization_url"?: string | null,"cached_discovery"?: Json | null,"client_id": string,"client_secret": string,"created_at"?: string,"custom_claims_allowlist"?: (string)[],"discovery_cached_at"?: string | null,"discovery_url"?: string | null,"email_optional"?: boolean,"enabled"?: boolean,"id"?: string,"identifier": string,"issuer"?: string | null,"jwks_uri"?: string | null,"name": string,"pkce_enabled"?: boolean,"provider_type": string,"scopes"?: (string)[],"skip_nonce_check"?: boolean,"token_url"?: string | null,"updated_at"?: string,"userinfo_url"?: string | null
                  }
                  Update: {
                    "acceptable_client_ids"?: (string)[],"attribute_mapping"?: NonNullable<Json>,"authorization_params"?: NonNullable<Json>,"authorization_url"?: string | null,"cached_discovery"?: Json | null,"client_id"?: string,"client_secret"?: string,"created_at"?: string,"custom_claims_allowlist"?: (string)[],"discovery_cached_at"?: string | null,"discovery_url"?: string | null,"email_optional"?: boolean,"enabled"?: boolean,"id"?: string,"identifier"?: string,"issuer"?: string | null,"jwks_uri"?: string | null,"name"?: string,"pkce_enabled"?: boolean,"provider_type"?: string,"scopes"?: (string)[],"skip_nonce_check"?: boolean,"token_url"?: string | null,"updated_at"?: string,"userinfo_url"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"flow_state": {
                  Row: {
                    "auth_code": string | null,"auth_code_issued_at": string | null,"authentication_method": string,"code_challenge": string | null,"code_challenge_method": Database["auth"]['Enums']["code_challenge_method"] | null,"created_at": string | null,"email_optional": boolean,"id": string,"invite_token": string | null,"linking_target_id": string | null,"oauth_client_state_id": string | null,"provider_access_token": string | null,"provider_refresh_token": string | null,"provider_type": string,"referrer": string | null,"updated_at": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "auth_code"?: string | null,"auth_code_issued_at"?: string | null,"authentication_method": string,"code_challenge"?: string | null,"code_challenge_method"?: Database["auth"]['Enums']["code_challenge_method"] | null,"created_at"?: string | null,"email_optional"?: boolean,"id": string,"invite_token"?: string | null,"linking_target_id"?: string | null,"oauth_client_state_id"?: string | null,"provider_access_token"?: string | null,"provider_refresh_token"?: string | null,"provider_type": string,"referrer"?: string | null,"updated_at"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "auth_code"?: string | null,"auth_code_issued_at"?: string | null,"authentication_method"?: string,"code_challenge"?: string | null,"code_challenge_method"?: Database["auth"]['Enums']["code_challenge_method"] | null,"created_at"?: string | null,"email_optional"?: boolean,"id"?: string,"invite_token"?: string | null,"linking_target_id"?: string | null,"oauth_client_state_id"?: string | null,"provider_access_token"?: string | null,"provider_refresh_token"?: string | null,"provider_type"?: string,"referrer"?: string | null,"updated_at"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"identities": {
                  Row: {
                    "created_at": string | null,"email": string | null,"id": string,"identity_data": NonNullable<Json>,"last_sign_in_at": string | null,"provider": string,"provider_id": string,"updated_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"email"?: never,"id"?: string,"identity_data": NonNullable<Json>,"last_sign_in_at"?: string | null,"provider": string,"provider_id": string,"updated_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string | null,"email"?: never,"id"?: string,"identity_data"?: NonNullable<Json>,"last_sign_in_at"?: string | null,"provider"?: string,"provider_id"?: string,"updated_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "identities_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"instances": {
                  Row: {
                    "created_at": string | null,"id": string,"raw_base_config": string | null,"updated_at": string | null,"uuid": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"id": string,"raw_base_config"?: string | null,"updated_at"?: string | null,"uuid"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"id"?: string,"raw_base_config"?: string | null,"updated_at"?: string | null,"uuid"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"mfa_amr_claims": {
                  Row: {
                    "authentication_method": string,"created_at": string,"id": string,"session_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "authentication_method": string,"created_at": string,"id": string,"session_id": string,"updated_at": string
                  }
                  Update: {
                    "authentication_method"?: string,"created_at"?: string,"id"?: string,"session_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "mfa_amr_claims_session_id_fkey"
      columns: ["session_id"]
isOneToOne: false
      referencedRelation: "sessions"
      referencedColumns: ["id"]
    }
                  ]
                },"mfa_challenges": {
                  Row: {
                    "created_at": string,"factor_id": string,"id": string,"ip_address": unknown,"otp_code": string | null,"verified_at": string | null,"web_authn_session_data": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at": string,"factor_id": string,"id": string,"ip_address": unknown,"otp_code"?: string | null,"verified_at"?: string | null,"web_authn_session_data"?: Json | null
                  }
                  Update: {
                    "created_at"?: string,"factor_id"?: string,"id"?: string,"ip_address"?: unknown,"otp_code"?: string | null,"verified_at"?: string | null,"web_authn_session_data"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "mfa_challenges_auth_factor_id_fkey"
      columns: ["factor_id"]
isOneToOne: false
      referencedRelation: "mfa_factors"
      referencedColumns: ["id"]
    }
                  ]
                },"mfa_factors": {
                  Row: {
                    "created_at": string,"factor_type": Database["auth"]['Enums']["factor_type"],"friendly_name": string | null,"id": string,"last_challenged_at": string | null,"last_webauthn_challenge_data": Json | null,"phone": string | null,"secret": string | null,"status": Database["auth"]['Enums']["factor_status"],"updated_at": string,"user_id": string,"web_authn_aaguid": string | null,"web_authn_credential": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at": string,"factor_type": Database["auth"]['Enums']["factor_type"],"friendly_name"?: string | null,"id": string,"last_challenged_at"?: string | null,"last_webauthn_challenge_data"?: Json | null,"phone"?: string | null,"secret"?: string | null,"status": Database["auth"]['Enums']["factor_status"],"updated_at": string,"user_id": string,"web_authn_aaguid"?: string | null,"web_authn_credential"?: Json | null
                  }
                  Update: {
                    "created_at"?: string,"factor_type"?: Database["auth"]['Enums']["factor_type"],"friendly_name"?: string | null,"id"?: string,"last_challenged_at"?: string | null,"last_webauthn_challenge_data"?: Json | null,"phone"?: string | null,"secret"?: string | null,"status"?: Database["auth"]['Enums']["factor_status"],"updated_at"?: string,"user_id"?: string,"web_authn_aaguid"?: string | null,"web_authn_credential"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "mfa_factors_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"mfa_recovery_code_sets": {
                  Row: {
                    "created_at": string,"failed_verification_count": number,"id": string,"mfa_factor_id": string,"updated_at": string,"user_id": string,"verification_locked_until": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"failed_verification_count"?: number,"id": string,"mfa_factor_id": string,"updated_at"?: string,"user_id": string,"verification_locked_until"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"failed_verification_count"?: number,"id"?: string,"mfa_factor_id"?: string,"updated_at"?: string,"user_id"?: string,"verification_locked_until"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "mfa_recovery_code_sets_mfa_factor_id_fkey"
      columns: ["mfa_factor_id"]
isOneToOne: true
      referencedRelation: "mfa_factors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "mfa_recovery_code_sets_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"mfa_recovery_codes": {
                  Row: {
                    "code_hash": string,"consumed_at": string | null,"created_at": string,"id": string,"mfa_recovery_code_set_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code_hash": string,"consumed_at"?: string | null,"created_at"?: string,"id": string,"mfa_recovery_code_set_id": string
                  }
                  Update: {
                    "code_hash"?: string,"consumed_at"?: string | null,"created_at"?: string,"id"?: string,"mfa_recovery_code_set_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "mfa_recovery_codes_mfa_recovery_code_set_id_fkey"
      columns: ["mfa_recovery_code_set_id"]
isOneToOne: false
      referencedRelation: "mfa_recovery_code_sets"
      referencedColumns: ["id"]
    }
                  ]
                },"oauth_authorizations": {
                  Row: {
                    "approved_at": string | null,"authorization_code": string | null,"authorization_id": string,"client_id": string,"code_challenge": string | null,"code_challenge_method": Database["auth"]['Enums']["code_challenge_method"] | null,"created_at": string,"expires_at": string,"id": string,"nonce": string | null,"redirect_uri": string,"resource": string | null,"response_type": Database["auth"]['Enums']["oauth_response_type"],"scope": string,"state": string | null,"status": Database["auth"]['Enums']["oauth_authorization_status"],"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "approved_at"?: string | null,"authorization_code"?: string | null,"authorization_id": string,"client_id": string,"code_challenge"?: string | null,"code_challenge_method"?: Database["auth"]['Enums']["code_challenge_method"] | null,"created_at"?: string,"expires_at"?: string,"id": string,"nonce"?: string | null,"redirect_uri": string,"resource"?: string | null,"response_type"?: Database["auth"]['Enums']["oauth_response_type"],"scope": string,"state"?: string | null,"status"?: Database["auth"]['Enums']["oauth_authorization_status"],"user_id"?: string | null
                  }
                  Update: {
                    "approved_at"?: string | null,"authorization_code"?: string | null,"authorization_id"?: string,"client_id"?: string,"code_challenge"?: string | null,"code_challenge_method"?: Database["auth"]['Enums']["code_challenge_method"] | null,"created_at"?: string,"expires_at"?: string,"id"?: string,"nonce"?: string | null,"redirect_uri"?: string,"resource"?: string | null,"response_type"?: Database["auth"]['Enums']["oauth_response_type"],"scope"?: string,"state"?: string | null,"status"?: Database["auth"]['Enums']["oauth_authorization_status"],"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "oauth_authorizations_client_id_fkey"
      columns: ["client_id"]
isOneToOne: false
      referencedRelation: "oauth_clients"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "oauth_authorizations_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"oauth_client_states": {
                  Row: {
                    "code_verifier": string | null,"created_at": string,"id": string,"provider_type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "code_verifier"?: string | null,"created_at": string,"id": string,"provider_type": string
                  }
                  Update: {
                    "code_verifier"?: string | null,"created_at"?: string,"id"?: string,"provider_type"?: string
                  }
                  Relationships: [
                    
                  ]
                },"oauth_clients": {
                  Row: {
                    "client_name": string | null,"client_secret_hash": string | null,"client_type": Database["auth"]['Enums']["oauth_client_type"],"client_uri": string | null,"created_at": string,"deleted_at": string | null,"grant_types": string,"id": string,"logo_uri": string | null,"redirect_uris": string,"registration_type": Database["auth"]['Enums']["oauth_registration_type"],"token_endpoint_auth_method": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "client_name"?: string | null,"client_secret_hash"?: string | null,"client_type"?: Database["auth"]['Enums']["oauth_client_type"],"client_uri"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"grant_types": string,"id": string,"logo_uri"?: string | null,"redirect_uris": string,"registration_type": Database["auth"]['Enums']["oauth_registration_type"],"token_endpoint_auth_method": string,"updated_at"?: string
                  }
                  Update: {
                    "client_name"?: string | null,"client_secret_hash"?: string | null,"client_type"?: Database["auth"]['Enums']["oauth_client_type"],"client_uri"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"grant_types"?: string,"id"?: string,"logo_uri"?: string | null,"redirect_uris"?: string,"registration_type"?: Database["auth"]['Enums']["oauth_registration_type"],"token_endpoint_auth_method"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"oauth_consents": {
                  Row: {
                    "client_id": string,"granted_at": string,"id": string,"revoked_at": string | null,"scopes": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "client_id": string,"granted_at"?: string,"id": string,"revoked_at"?: string | null,"scopes": string,"user_id": string
                  }
                  Update: {
                    "client_id"?: string,"granted_at"?: string,"id"?: string,"revoked_at"?: string | null,"scopes"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "oauth_consents_client_id_fkey"
      columns: ["client_id"]
isOneToOne: false
      referencedRelation: "oauth_clients"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "oauth_consents_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"one_time_tokens": {
                  Row: {
                    "created_at": string,"expires_at": string | null,"id": string,"relates_to": string,"token_hash": string,"token_type": Database["auth"]['Enums']["one_time_token_type"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"expires_at"?: string | null,"id": string,"relates_to": string,"token_hash": string,"token_type": Database["auth"]['Enums']["one_time_token_type"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"expires_at"?: string | null,"id"?: string,"relates_to"?: string,"token_hash"?: string,"token_type"?: Database["auth"]['Enums']["one_time_token_type"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "one_time_tokens_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"refresh_tokens": {
                  Row: {
                    "created_at": string | null,"id": number,"instance_id": string | null,"parent": string | null,"revoked": boolean | null,"session_id": string | null,"token": string | null,"updated_at": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"id"?: number,"instance_id"?: string | null,"parent"?: string | null,"revoked"?: boolean | null,"session_id"?: string | null,"token"?: string | null,"updated_at"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"id"?: number,"instance_id"?: string | null,"parent"?: string | null,"revoked"?: boolean | null,"session_id"?: string | null,"token"?: string | null,"updated_at"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "refresh_tokens_session_id_fkey"
      columns: ["session_id"]
isOneToOne: false
      referencedRelation: "sessions"
      referencedColumns: ["id"]
    }
                  ]
                },"saml_providers": {
                  Row: {
                    "attribute_mapping": Json | null,"created_at": string | null,"entity_id": string,"id": string,"metadata_url": string | null,"metadata_xml": string,"name_id_format": string | null,"sso_provider_id": string,"updated_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "attribute_mapping"?: Json | null,"created_at"?: string | null,"entity_id": string,"id": string,"metadata_url"?: string | null,"metadata_xml": string,"name_id_format"?: string | null,"sso_provider_id": string,"updated_at"?: string | null
                  }
                  Update: {
                    "attribute_mapping"?: Json | null,"created_at"?: string | null,"entity_id"?: string,"id"?: string,"metadata_url"?: string | null,"metadata_xml"?: string,"name_id_format"?: string | null,"sso_provider_id"?: string,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "saml_providers_sso_provider_id_fkey"
      columns: ["sso_provider_id"]
isOneToOne: false
      referencedRelation: "sso_providers"
      referencedColumns: ["id"]
    }
                  ]
                },"saml_relay_states": {
                  Row: {
                    "created_at": string | null,"flow_state_id": string | null,"for_email": string | null,"id": string,"redirect_to": string | null,"request_id": string,"sso_provider_id": string,"updated_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"flow_state_id"?: string | null,"for_email"?: string | null,"id": string,"redirect_to"?: string | null,"request_id": string,"sso_provider_id": string,"updated_at"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"flow_state_id"?: string | null,"for_email"?: string | null,"id"?: string,"redirect_to"?: string | null,"request_id"?: string,"sso_provider_id"?: string,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "saml_relay_states_flow_state_id_fkey"
      columns: ["flow_state_id"]
isOneToOne: false
      referencedRelation: "flow_state"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "saml_relay_states_sso_provider_id_fkey"
      columns: ["sso_provider_id"]
isOneToOne: false
      referencedRelation: "sso_providers"
      referencedColumns: ["id"]
    }
                  ]
                },"schema_migrations": {
                  Row: {
                    "version": string
                  }
                  ComputedFields: never
                  Insert: {
                    "version": string
                  }
                  Update: {
                    "version"?: string
                  }
                  Relationships: [
                    
                  ]
                },"scim_tokens": {
                  Row: {
                    "created_at": string,"expires_at": string | null,"id": string,"last_used_at": string | null,"prefix": string,"revoked_at": string | null,"sso_provider_id": string,"token_hash": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"expires_at"?: string | null,"id": string,"last_used_at"?: string | null,"prefix": string,"revoked_at"?: string | null,"sso_provider_id": string,"token_hash": string
                  }
                  Update: {
                    "created_at"?: string,"expires_at"?: string | null,"id"?: string,"last_used_at"?: string | null,"prefix"?: string,"revoked_at"?: string | null,"sso_provider_id"?: string,"token_hash"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "scim_tokens_sso_provider_id_fkey"
      columns: ["sso_provider_id"]
isOneToOne: false
      referencedRelation: "sso_providers"
      referencedColumns: ["id"]
    }
                  ]
                },"scim_users": {
                  Row: {
                    "active": boolean,"created_at": string,"deleted_at": string | null,"external_id": string | null,"id": string,"resource": NonNullable<Json>,"sso_provider_id": string,"updated_at": string,"user_id": string | null,"user_name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: never,"created_at"?: string,"deleted_at"?: string | null,"external_id"?: never,"id": string,"resource": NonNullable<Json>,"sso_provider_id": string,"updated_at"?: string,"user_id"?: string | null,"user_name"?: never
                  }
                  Update: {
                    "active"?: never,"created_at"?: string,"deleted_at"?: string | null,"external_id"?: never,"id"?: string,"resource"?: NonNullable<Json>,"sso_provider_id"?: string,"updated_at"?: string,"user_id"?: string | null,"user_name"?: never
                  }
                  Relationships: [
                    {
      foreignKeyName: "scim_users_sso_provider_id_fkey"
      columns: ["sso_provider_id"]
isOneToOne: false
      referencedRelation: "sso_providers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "scim_users_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"sessions": {
                  Row: {
                    "aal": Database["auth"]['Enums']["aal_level"] | null,"created_at": string | null,"factor_id": string | null,"id": string,"ip": unknown,"not_after": string | null,"oauth_client_id": string | null,"refresh_token_counter": number | null,"refresh_token_hmac_key": string | null,"refreshed_at": string | null,"scopes": string | null,"tag": string | null,"updated_at": string | null,"user_agent": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "aal"?: Database["auth"]['Enums']["aal_level"] | null,"created_at"?: string | null,"factor_id"?: string | null,"id": string,"ip"?: unknown,"not_after"?: string | null,"oauth_client_id"?: string | null,"refresh_token_counter"?: number | null,"refresh_token_hmac_key"?: string | null,"refreshed_at"?: string | null,"scopes"?: string | null,"tag"?: string | null,"updated_at"?: string | null,"user_agent"?: string | null,"user_id": string
                  }
                  Update: {
                    "aal"?: Database["auth"]['Enums']["aal_level"] | null,"created_at"?: string | null,"factor_id"?: string | null,"id"?: string,"ip"?: unknown,"not_after"?: string | null,"oauth_client_id"?: string | null,"refresh_token_counter"?: number | null,"refresh_token_hmac_key"?: string | null,"refreshed_at"?: string | null,"scopes"?: string | null,"tag"?: string | null,"updated_at"?: string | null,"user_agent"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sessions_oauth_client_id_fkey"
      columns: ["oauth_client_id"]
isOneToOne: false
      referencedRelation: "oauth_clients"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "sessions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"sso_domains": {
                  Row: {
                    "created_at": string | null,"domain": string,"id": string,"sso_provider_id": string,"updated_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"domain": string,"id": string,"sso_provider_id": string,"updated_at"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"domain"?: string,"id"?: string,"sso_provider_id"?: string,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "sso_domains_sso_provider_id_fkey"
      columns: ["sso_provider_id"]
isOneToOne: false
      referencedRelation: "sso_providers"
      referencedColumns: ["id"]
    }
                  ]
                },"sso_providers": {
                  Row: {
                    "created_at": string | null,"disabled": boolean | null,"id": string,"resource_id": string | null,"updated_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"disabled"?: boolean | null,"id": string,"resource_id"?: string | null,"updated_at"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"disabled"?: boolean | null,"id"?: string,"resource_id"?: string | null,"updated_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"users": {
                  Row: {
                    "aud": string | null,"banned_until": string | null,"confirmation_sent_at": string | null,"confirmation_token": string | null,"confirmed_at": string | null,"created_at": string | null,"deleted_at": string | null,"email": string | null,"email_change": string | null,"email_change_confirm_status": number | null,"email_change_sent_at": string | null,"email_change_token_current": string | null,"email_change_token_new": string | null,"email_confirmed_at": string | null,"encrypted_password": string | null,"id": string,"instance_id": string | null,"invited_at": string | null,"is_anonymous": boolean,"is_sso_user": boolean,"is_super_admin": boolean | null,"last_sign_in_at": string | null,"phone": string | null,"phone_change": string | null,"phone_change_sent_at": string | null,"phone_change_token": string | null,"phone_confirmed_at": string | null,"raw_app_meta_data": Json | null,"raw_user_meta_data": Json | null,"reauthentication_sent_at": string | null,"reauthentication_token": string | null,"recovery_sent_at": string | null,"recovery_token": string | null,"role": string | null,"updated_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "aud"?: string | null,"banned_until"?: string | null,"confirmation_sent_at"?: string | null,"confirmation_token"?: string | null,"confirmed_at"?: never,"created_at"?: string | null,"deleted_at"?: string | null,"email"?: string | null,"email_change"?: string | null,"email_change_confirm_status"?: number | null,"email_change_sent_at"?: string | null,"email_change_token_current"?: string | null,"email_change_token_new"?: string | null,"email_confirmed_at"?: string | null,"encrypted_password"?: string | null,"id": string,"instance_id"?: string | null,"invited_at"?: string | null,"is_anonymous"?: boolean,"is_sso_user"?: boolean,"is_super_admin"?: boolean | null,"last_sign_in_at"?: string | null,"phone"?: string | null,"phone_change"?: string | null,"phone_change_sent_at"?: string | null,"phone_change_token"?: string | null,"phone_confirmed_at"?: string | null,"raw_app_meta_data"?: Json | null,"raw_user_meta_data"?: Json | null,"reauthentication_sent_at"?: string | null,"reauthentication_token"?: string | null,"recovery_sent_at"?: string | null,"recovery_token"?: string | null,"role"?: string | null,"updated_at"?: string | null
                  }
                  Update: {
                    "aud"?: string | null,"banned_until"?: string | null,"confirmation_sent_at"?: string | null,"confirmation_token"?: string | null,"confirmed_at"?: never,"created_at"?: string | null,"deleted_at"?: string | null,"email"?: string | null,"email_change"?: string | null,"email_change_confirm_status"?: number | null,"email_change_sent_at"?: string | null,"email_change_token_current"?: string | null,"email_change_token_new"?: string | null,"email_confirmed_at"?: string | null,"encrypted_password"?: string | null,"id"?: string,"instance_id"?: string | null,"invited_at"?: string | null,"is_anonymous"?: boolean,"is_sso_user"?: boolean,"is_super_admin"?: boolean | null,"last_sign_in_at"?: string | null,"phone"?: string | null,"phone_change"?: string | null,"phone_change_sent_at"?: string | null,"phone_change_token"?: string | null,"phone_confirmed_at"?: string | null,"raw_app_meta_data"?: Json | null,"raw_user_meta_data"?: Json | null,"reauthentication_sent_at"?: string | null,"reauthentication_token"?: string | null,"recovery_sent_at"?: string | null,"recovery_token"?: string | null,"role"?: string | null,"updated_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"webauthn_challenges": {
                  Row: {
                    "challenge_type": string,"created_at": string,"expires_at": string,"id": string,"session_data": NonNullable<Json>,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "challenge_type": string,"created_at"?: string,"expires_at": string,"id"?: string,"session_data": NonNullable<Json>,"user_id"?: string | null
                  }
                  Update: {
                    "challenge_type"?: string,"created_at"?: string,"expires_at"?: string,"id"?: string,"session_data"?: NonNullable<Json>,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "webauthn_challenges_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                },"webauthn_credentials": {
                  Row: {
                    "aaguid": string | null,"attestation_type": string,"backed_up": boolean,"backup_eligible": boolean,"created_at": string,"credential_id": string,"friendly_name": string,"id": string,"last_used_at": string | null,"public_key": string,"sign_count": number,"transports": NonNullable<Json>,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "aaguid"?: string | null,"attestation_type"?: string,"backed_up"?: boolean,"backup_eligible"?: boolean,"created_at"?: string,"credential_id": string,"friendly_name"?: string,"id"?: string,"last_used_at"?: string | null,"public_key": string,"sign_count"?: number,"transports"?: NonNullable<Json>,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "aaguid"?: string | null,"attestation_type"?: string,"backed_up"?: boolean,"backup_eligible"?: boolean,"created_at"?: string,"credential_id"?: string,"friendly_name"?: string,"id"?: string,"last_used_at"?: string | null,"public_key"?: string,"sign_count"?: number,"transports"?: NonNullable<Json>,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "webauthn_credentials_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "email":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"jwt":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"role":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"uid":
{ Args: Record<PropertyKey, never>; Returns: string
                           }
          }
          Enums: {
            "aal_level": "aal1"|"aal2"|"aal3","code_challenge_method": "s256"|"plain","factor_status": "unverified"|"verified","factor_type": "totp"|"webauthn"|"phone"|"recovery_code","oauth_authorization_status": "pending"|"approved"|"denied"|"expired","oauth_client_type": "public"|"confidential","oauth_registration_type": "dynamic"|"manual","oauth_response_type": "code","one_time_token_type": "confirmation_token"|"reauthentication_token"|"recovery_token"|"email_change_token_new"|"email_change_token_current"|"phone_change_token"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "achievements": {
                  Row: {
                    "achievement_type": Database["public"]['Enums']["achievement_type"],"achievement_value": number | null,"created_at": string,"id": string,"unlocked_at": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "achievement_type": Database["public"]['Enums']["achievement_type"],"achievement_value"?: number | null,"created_at"?: string,"id"?: string,"unlocked_at"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "achievement_type"?: Database["public"]['Enums']["achievement_type"],"achievement_value"?: number | null,"created_at"?: string,"id"?: string,"unlocked_at"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "achievements_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "achievements_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"app_migrations": {
                  Row: {
                    "applied_at": string,"filename": string
                  }
                  ComputedFields: never
                  Insert: {
                    "applied_at"?: string,"filename": string
                  }
                  Update: {
                    "applied_at"?: string,"filename"?: string
                  }
                  Relationships: [
                    
                  ]
                },"audit_log": {
                  Row: {
                    "action": string,"created_at": string,"error_msg": string | null,"id": number,"params": Json | null,"result": string | null,"tx_id": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"created_at"?: string,"error_msg"?: string | null,"id"?: number,"params"?: Json | null,"result"?: string | null,"tx_id"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "action"?: string,"created_at"?: string,"error_msg"?: string | null,"id"?: number,"params"?: Json | null,"result"?: string | null,"tx_id"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "audit_log_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"checkin_occurrences": {
                  Row: {
                    "checkin_date": string | null,"checkin_record_id": string | null,"created_at": string,"deadline_at": string,"id": string,"makeup_usage_id": string | null,"penalty_capped_amount": number | null,"penalty_transaction_id": string | null,"period_end": string,"period_start": string,"project_id": string,"status": Database["public"]['Enums']["occurrence_status"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "checkin_date"?: string | null,"checkin_record_id"?: string | null,"created_at"?: string,"deadline_at": string,"id"?: string,"makeup_usage_id"?: string | null,"penalty_capped_amount"?: number | null,"penalty_transaction_id"?: string | null,"period_end": string,"period_start": string,"project_id": string,"status"?: Database["public"]['Enums']["occurrence_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "checkin_date"?: string | null,"checkin_record_id"?: string | null,"created_at"?: string,"deadline_at"?: string,"id"?: string,"makeup_usage_id"?: string | null,"penalty_capped_amount"?: number | null,"penalty_transaction_id"?: string | null,"period_end"?: string,"period_start"?: string,"project_id"?: string,"status"?: Database["public"]['Enums']["occurrence_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "checkin_occurrences_checkin_record_id_fkey"
      columns: ["checkin_record_id"]
isOneToOne: false
      referencedRelation: "checkin_records"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "checkin_occurrences_makeup_usage_id_fkey"
      columns: ["makeup_usage_id"]
isOneToOne: false
      referencedRelation: "makeup_usages"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "checkin_occurrences_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "checkin_projects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "checkin_occurrences_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "checkin_occurrences_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"checkin_projects": {
                  Row: {
                    "archived_at": string | null,"checkin_mode": Database["public"]['Enums']["checkin_mode_type"] | null,"color": string | null,"created_at": string,"current_progress": number,"current_streak": number,"deadline_time": string,"deleted_at": string | null,"frequency": Database["public"]['Enums']["project_frequency_type"],"frequency_config": Json | null,"group_settle_decided_through": string | null,"icon": string | null,"id": string,"makeup_count": number,"makeup_reward_mode": Database["public"]['Enums']["makeup_reward_mode_type"],"makeup_reward_ratio": number | null,"makeup_type": Database["public"]['Enums']["makeup_type"],"makeup_validity_days": number,"max_members": number,"max_streak": number,"name": string,"owner_id": string,"penalty_amount": number,"project_type": Database["public"]['Enums']["project_type"],"reminder_time": string | null,"reward_amount": number,"reward_amount_per_settlement": number,"reward_mode": Database["public"]['Enums']["reward_mode_type"],"reward_n_value": number | null,"reward_pool": number | null,"reward_pool_lifetime_budget": number | null,"reward_remainder_recipient_id": string | null,"shared_makeup_remaining": number | null,"starts_at": string,"status": Database["public"]['Enums']["project_status"],"target_count": number | null,"target_description": string | null,"task_type": Database["public"]['Enums']["task_type"],"timezone": string,"updated_at": string,"visibility": Database["public"]['Enums']["project_visibility"]
                  }
                  ComputedFields: never
                  Insert: {
                    "archived_at"?: string | null,"checkin_mode"?: Database["public"]['Enums']["checkin_mode_type"] | null,"color"?: string | null,"created_at"?: string,"current_progress"?: number,"current_streak"?: number,"deadline_time"?: string,"deleted_at"?: string | null,"frequency"?: Database["public"]['Enums']["project_frequency_type"],"frequency_config"?: Json | null,"group_settle_decided_through"?: string | null,"icon"?: string | null,"id"?: string,"makeup_count"?: number,"makeup_reward_mode"?: Database["public"]['Enums']["makeup_reward_mode_type"],"makeup_reward_ratio"?: number | null,"makeup_type"?: Database["public"]['Enums']["makeup_type"],"makeup_validity_days"?: number,"max_members"?: number,"max_streak"?: number,"name": string,"owner_id": string,"penalty_amount"?: number,"project_type"?: Database["public"]['Enums']["project_type"],"reminder_time"?: string | null,"reward_amount"?: number,"reward_amount_per_settlement"?: number,"reward_mode"?: Database["public"]['Enums']["reward_mode_type"],"reward_n_value"?: number | null,"reward_pool"?: number | null,"reward_pool_lifetime_budget"?: number | null,"reward_remainder_recipient_id"?: string | null,"shared_makeup_remaining"?: number | null,"starts_at"?: string,"status"?: Database["public"]['Enums']["project_status"],"target_count"?: number | null,"target_description"?: string | null,"task_type"?: Database["public"]['Enums']["task_type"],"timezone"?: string,"updated_at"?: string,"visibility"?: Database["public"]['Enums']["project_visibility"]
                  }
                  Update: {
                    "archived_at"?: string | null,"checkin_mode"?: Database["public"]['Enums']["checkin_mode_type"] | null,"color"?: string | null,"created_at"?: string,"current_progress"?: number,"current_streak"?: number,"deadline_time"?: string,"deleted_at"?: string | null,"frequency"?: Database["public"]['Enums']["project_frequency_type"],"frequency_config"?: Json | null,"group_settle_decided_through"?: string | null,"icon"?: string | null,"id"?: string,"makeup_count"?: number,"makeup_reward_mode"?: Database["public"]['Enums']["makeup_reward_mode_type"],"makeup_reward_ratio"?: number | null,"makeup_type"?: Database["public"]['Enums']["makeup_type"],"makeup_validity_days"?: number,"max_members"?: number,"max_streak"?: number,"name"?: string,"owner_id"?: string,"penalty_amount"?: number,"project_type"?: Database["public"]['Enums']["project_type"],"reminder_time"?: string | null,"reward_amount"?: number,"reward_amount_per_settlement"?: number,"reward_mode"?: Database["public"]['Enums']["reward_mode_type"],"reward_n_value"?: number | null,"reward_pool"?: number | null,"reward_pool_lifetime_budget"?: number | null,"reward_remainder_recipient_id"?: string | null,"shared_makeup_remaining"?: number | null,"starts_at"?: string,"status"?: Database["public"]['Enums']["project_status"],"target_count"?: number | null,"target_description"?: string | null,"task_type"?: Database["public"]['Enums']["task_type"],"timezone"?: string,"updated_at"?: string,"visibility"?: Database["public"]['Enums']["project_visibility"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "checkin_projects_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "checkin_projects_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "checkin_projects_reward_remainder_recipient_id_fkey"
      columns: ["reward_remainder_recipient_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "checkin_projects_reward_remainder_recipient_id_fkey"
      columns: ["reward_remainder_recipient_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"checkin_records": {
                  Row: {
                    "attempt_no": number,"checked_at": string,"checkin_date": string,"created_at": string,"id": string,"is_makeup": boolean,"makeuped_at": string | null,"note": string | null,"photo": string | null,"project_id": string,"revoked_at": string | null,"reward_earned": number,"reward_mode_snapshot": Database["public"]['Enums']["reward_mode_type"] | null,"status": Database["public"]['Enums']["checkin_attempt_status"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempt_no"?: number,"checked_at"?: string,"checkin_date": string,"created_at"?: string,"id"?: string,"is_makeup"?: boolean,"makeuped_at"?: string | null,"note"?: string | null,"photo"?: string | null,"project_id": string,"revoked_at"?: string | null,"reward_earned"?: number,"reward_mode_snapshot"?: Database["public"]['Enums']["reward_mode_type"] | null,"status"?: Database["public"]['Enums']["checkin_attempt_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "attempt_no"?: number,"checked_at"?: string,"checkin_date"?: string,"created_at"?: string,"id"?: string,"is_makeup"?: boolean,"makeuped_at"?: string | null,"note"?: string | null,"photo"?: string | null,"project_id"?: string,"revoked_at"?: string | null,"reward_earned"?: number,"reward_mode_snapshot"?: Database["public"]['Enums']["reward_mode_type"] | null,"status"?: Database["public"]['Enums']["checkin_attempt_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "checkin_records_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "checkin_projects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "checkin_records_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "checkin_records_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"debt_records": {
                  Row: {
                    "amount": number,"created_at": string,"id": string,"occurrence_id": string,"project_id": string,"settle_transaction_id": string | null,"settled_at": string | null,"status": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"created_at"?: string,"id"?: string,"occurrence_id": string,"project_id": string,"settle_transaction_id"?: string | null,"settled_at"?: string | null,"status"?: string,"user_id": string
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"id"?: string,"occurrence_id"?: string,"project_id"?: string,"settle_transaction_id"?: string | null,"settled_at"?: string | null,"status"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "debt_records_occurrence_id_fkey"
      columns: ["occurrence_id"]
isOneToOne: false
      referencedRelation: "checkin_occurrences"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "debt_records_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "checkin_projects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "debt_records_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "debt_records_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"e2e_run_lock": {
                  Row: {
                    "acquired_at": string,"lock_key": number,"run_token": string
                  }
                  ComputedFields: never
                  Insert: {
                    "acquired_at"?: string,"lock_key": number,"run_token": string
                  }
                  Update: {
                    "acquired_at"?: string,"lock_key"?: number,"run_token"?: string
                  }
                  Relationships: [
                    
                  ]
                },"expenses": {
                  Row: {
                    "amount": number,"category": string | null,"created_at": string,"deleted_at": string | null,"expense_date": string,"id": string,"note": string | null,"transaction_id": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"category"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"expense_date"?: string,"id"?: string,"note"?: string | null,"transaction_id": string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "amount"?: number,"category"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"expense_date"?: string,"id"?: string,"note"?: string | null,"transaction_id"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "expenses_transaction_id_fkey"
      columns: ["transaction_id"]
isOneToOne: true
      referencedRelation: "transactions"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "expenses_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "expenses_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"friendships": {
                  Row: {
                    "accepted_at": string | null,"created_at": string,"id": string,"requested_by": string,"status": Database["public"]['Enums']["friendship_status"],"user_high_id": string,"user_low_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accepted_at"?: string | null,"created_at"?: string,"id"?: string,"requested_by": string,"status"?: Database["public"]['Enums']["friendship_status"],"user_high_id": string,"user_low_id": string
                  }
                  Update: {
                    "accepted_at"?: string | null,"created_at"?: string,"id"?: string,"requested_by"?: string,"status"?: Database["public"]['Enums']["friendship_status"],"user_high_id"?: string,"user_low_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "fk_friendships_requested_by"
      columns: ["requested_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "fk_friendships_requested_by"
      columns: ["requested_by"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "fk_friendships_user_high"
      columns: ["user_high_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "fk_friendships_user_high"
      columns: ["user_high_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "fk_friendships_user_low"
      columns: ["user_low_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "fk_friendships_user_low"
      columns: ["user_low_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"makeup_usages": {
                  Row: {
                    "checkin_record_id": string | null,"created_at": string,"id": string,"makeup_type": Database["public"]['Enums']["makeup_type_enum"],"occurrence_id": string,"project_id": string,"reward_transaction_id": string | null,"used_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "checkin_record_id"?: string | null,"created_at"?: string,"id"?: string,"makeup_type": Database["public"]['Enums']["makeup_type_enum"],"occurrence_id": string,"project_id": string,"reward_transaction_id"?: string | null,"used_at"?: string,"user_id": string
                  }
                  Update: {
                    "checkin_record_id"?: string | null,"created_at"?: string,"id"?: string,"makeup_type"?: Database["public"]['Enums']["makeup_type_enum"],"occurrence_id"?: string,"project_id"?: string,"reward_transaction_id"?: string | null,"used_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "makeup_usages_checkin_record_id_fkey"
      columns: ["checkin_record_id"]
isOneToOne: false
      referencedRelation: "checkin_records"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "makeup_usages_occurrence_id_fkey"
      columns: ["occurrence_id"]
isOneToOne: false
      referencedRelation: "checkin_occurrences"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "makeup_usages_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "checkin_projects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "makeup_usages_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "makeup_usages_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar": string | null,"created_at": string,"deleted_at": string | null,"id": string,"nickname": string,"profile_visibility": Database["public"]['Enums']["project_visibility"],"timezone": string,"total_earned": number,"total_penalty": number,"total_revoked": number,"total_spent": number,"updated_at": string,"wallet_balance": number
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"id": string,"nickname": string,"profile_visibility"?: Database["public"]['Enums']["project_visibility"],"timezone"?: string,"total_earned"?: number,"total_penalty"?: number,"total_revoked"?: number,"total_spent"?: number,"updated_at"?: string,"wallet_balance"?: number
                  }
                  Update: {
                    "avatar"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"id"?: string,"nickname"?: string,"profile_visibility"?: Database["public"]['Enums']["project_visibility"],"timezone"?: string,"total_earned"?: number,"total_penalty"?: number,"total_revoked"?: number,"total_spent"?: number,"updated_at"?: string,"wallet_balance"?: number
                  }
                  Relationships: [
                    
                  ]
                },"project_members": {
                  Row: {
                    "created_at": string,"id": string,"invited_by": string | null,"joined_at": string | null,"makeup_used": number,"project_id": string,"quit_at": string | null,"role": Database["public"]['Enums']["member_role"],"status": Database["public"]['Enums']["member_status"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"invited_by"?: string | null,"joined_at"?: string | null,"makeup_used"?: number,"project_id": string,"quit_at"?: string | null,"role"?: Database["public"]['Enums']["member_role"],"status"?: Database["public"]['Enums']["member_status"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"invited_by"?: string | null,"joined_at"?: string | null,"makeup_used"?: number,"project_id"?: string,"quit_at"?: string | null,"role"?: Database["public"]['Enums']["member_role"],"status"?: Database["public"]['Enums']["member_status"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "project_members_invited_by_fkey"
      columns: ["invited_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "project_members_invited_by_fkey"
      columns: ["invited_by"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "project_members_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "checkin_projects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "project_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "project_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"reward_events": {
                  Row: {
                    "amount": number,"created_at": string,"id": string,"project_id": string,"reason": string,"revoke_transaction_id": string | null,"revoked_at": string | null,"reward_transaction_id": string,"source_id": string,"source_type": string,"trigger_checkin_id": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"created_at"?: string,"id"?: string,"project_id": string,"reason": string,"revoke_transaction_id"?: string | null,"revoked_at"?: string | null,"reward_transaction_id": string,"source_id": string,"source_type": string,"trigger_checkin_id"?: string | null,"user_id": string
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"id"?: string,"project_id"?: string,"reason"?: string,"revoke_transaction_id"?: string | null,"revoked_at"?: string | null,"reward_transaction_id"?: string,"source_id"?: string,"source_type"?: string,"trigger_checkin_id"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reward_events_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "checkin_projects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reward_events_trigger_checkin_id_fkey"
      columns: ["trigger_checkin_id"]
isOneToOne: false
      referencedRelation: "checkin_records"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reward_events_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reward_events_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"reward_settlements": {
                  Row: {
                    "allocations": NonNullable<Json>,"created_at": string,"id": string,"member_count": number,"milestone_no": number | null,"owner_bonus": number,"per_member_amount": number,"project_id": string,"reward_transaction_ids": (string)[] | null,"settlement_key": string,"settlement_round": number,"settlement_type": Database["public"]['Enums']["settlement_type_enum"],"total_pool": number,"trigger_date": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "allocations": NonNullable<Json>,"created_at"?: string,"id"?: string,"member_count": number,"milestone_no"?: number | null,"owner_bonus"?: number,"per_member_amount": number,"project_id": string,"reward_transaction_ids"?: (string)[] | null,"settlement_key": string,"settlement_round": number,"settlement_type": Database["public"]['Enums']["settlement_type_enum"],"total_pool": number,"trigger_date"?: string | null
                  }
                  Update: {
                    "allocations"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"member_count"?: number,"milestone_no"?: number | null,"owner_bonus"?: number,"per_member_amount"?: number,"project_id"?: string,"reward_transaction_ids"?: (string)[] | null,"settlement_key"?: string,"settlement_round"?: number,"settlement_type"?: Database["public"]['Enums']["settlement_type_enum"],"total_pool"?: number,"trigger_date"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "reward_settlements_project_id_fkey"
      columns: ["project_id"]
isOneToOne: false
      referencedRelation: "checkin_projects"
      referencedColumns: ["id"]
    }
                  ]
                },"transactions": {
                  Row: {
                    "amount": number,"balance_after": number,"created_at": string,"description": string | null,"id": string,"idempotency_key": string | null,"reason": string | null,"related_checkin_id": string | null,"related_expense_id": string | null,"related_project_id": string | null,"sequence_no": number,"transaction_type": Database["public"]['Enums']["transaction_type"],"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"balance_after": number,"created_at"?: string,"description"?: string | null,"id"?: string,"idempotency_key"?: string | null,"reason"?: string | null,"related_checkin_id"?: string | null,"related_expense_id"?: string | null,"related_project_id"?: string | null,"sequence_no"?: number,"transaction_type": Database["public"]['Enums']["transaction_type"],"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "amount"?: number,"balance_after"?: number,"created_at"?: string,"description"?: string | null,"id"?: string,"idempotency_key"?: string | null,"reason"?: string | null,"related_checkin_id"?: string | null,"related_expense_id"?: string | null,"related_project_id"?: string | null,"sequence_no"?: number,"transaction_type"?: Database["public"]['Enums']["transaction_type"],"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "transactions_related_checkin_id_fkey"
      columns: ["related_checkin_id"]
isOneToOne: false
      referencedRelation: "checkin_records"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "transactions_related_project_id_fkey"
      columns: ["related_project_id"]
isOneToOne: false
      referencedRelation: "checkin_projects"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "transactions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "transactions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "v_visible_profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "v_visible_profiles": {
                  Row: {
                    "avatar": string | null,"created_at": string | null,"id": string | null,"nickname": string | null,"profile_visibility": Database["public"]['Enums']["project_visibility"] | null
                  }
                  ComputedFields: never
                  Insert: {
                           "avatar"?: string | null,"created_at"?: string | null,"id"?: string | null,"nickname"?: string | null,"profile_visibility"?: Database["public"]['Enums']["project_visibility"] | null
                         }
                        Update: {
                           "avatar"?: string | null,"created_at"?: string | null,"id"?: string | null,"nickname"?: string | null,"profile_visibility"?: Database["public"]['Enums']["project_visibility"] | null
                         }
                        Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "_finite_done_days":
{ Args: { "p_as_of"?: string,"p_project_id": string }; Returns: number
                           },
"_grant_reward_internal":
{ Args: { "p_amount": number,"p_idem_key"?: string,"p_project_id": string,"p_reason"?: string,"p_source_id"?: string,"p_source_type"?: string,"p_trigger_checkin_id"?: string,"p_user_id": string }; Returns: string
                           },
"_insert_transaction":
{ Args: { "p_amount": number,"p_description"?: string,"p_idempotency_key"?: string,"p_reason"?: string,"p_related_checkin_id"?: string,"p_related_expense_id"?: string,"p_related_project_id"?: string,"p_transaction_type": Database["public"]['Enums']["transaction_type"],"p_user_id": string }; Returns: string
                           },
"_penalize_any_one_mode_internal":
{ Args: { "p_description"?: string,"p_penalty": number,"p_project_id": string,"p_target_date": string }; Returns: {
              "tx_id": string,"user_id": string
            }[]
                           },
"_penalize_user_internal":
{ Args: { "p_amount": number,"p_description"?: string,"p_period_key": string,"p_project_id": string,"p_user_id": string }; Returns: string
                           },
"_recalc_project_streak_occurrence_aware":
{ Args: { "p_project_id": string }; Returns: undefined
                           },
"_settle_personal_completion":
{ Args: { "p_project_id": string }; Returns: undefined
                           },
"_settle_personal_every_n":
{ Args: { "p_project_id": string,"p_trigger_checkin_id": string }; Returns: undefined
                           },
"accept_friendship":
{ Args: { "p_friendship_id": string }; Returns: undefined
                           },
"accept_invitation":
{ Args: { "p_project_id": string }; Returns: undefined
                           },
"can_access_project":
{ Args: { "p_project_id": string }; Returns: boolean
                           },
"can_view_profile":
{ Args: { "p_profile_id": string }; Returns: boolean
                           },
"can_view_project_activity":
{ Args: { "p_project_id": string }; Returns: boolean
                           },
"cancel_project":
{ Args: { "p_project_id": string }; Returns: undefined
                           },
"cancel_project_invitation":
{ Args: { "p_project_id": string,"p_user_id": string }; Returns: undefined
                           },
"create_checkin":
{ Args: { "p_note"?: string,"p_photo"?: string,"p_project_id": string }; Returns: string
                           },
"create_project":
{ Args: { "p_checkin_mode"?: Database["public"]['Enums']["checkin_mode_type"],"p_deadline_time"?: string,"p_description"?: string,"p_frequency": Database["public"]['Enums']["project_frequency_type"],"p_icon"?: string,"p_makeup_count"?: number,"p_makeup_reward_mode"?: Database["public"]['Enums']["makeup_reward_mode_type"],"p_makeup_reward_ratio"?: number,"p_makeup_type"?: Database["public"]['Enums']["makeup_type"],"p_makeup_validity_days"?: number,"p_name": string,"p_penalty_amount"?: number,"p_project_type": Database["public"]['Enums']["project_type"],"p_reminder_time"?: string,"p_reward_amount": number,"p_reward_mode"?: Database["public"]['Enums']["reward_mode_type"],"p_reward_n_value"?: number,"p_reward_pool_lifetime_budget"?: number,"p_starts_at"?: string,"p_target_count"?: number,"p_timezone"?: string,"p_visibility"?: Database["public"]['Enums']["project_visibility"] }; Returns: string
                           },
"cron_activate_pending_projects":
{ Args: Record<PropertyKey, never>; Returns: {
              "project_id": string
            }[]
                           },
"cron_generate_today_occurrences":
{ Args: Record<PropertyKey, never>; Returns: {
              "out_occurrence_id": string,"out_project_id": string,"out_user_id": string
            }[]
                           },
"cron_process_missed_occurrences":
{ Args: Record<PropertyKey, never>; Returns: {
              "final_status": string,"occurrence_id": string
            }[]
                           },
"cron_settle_group_rewards":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"current_user_id":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"delete_expense":
{ Args: { "p_expense_id": string }; Returns: undefined
                           },
"delete_friendship":
{ Args: { "p_friendship_id": string }; Returns: undefined
                           },
"get_friend_leaderboard":
{ Args: Record<PropertyKey, never>; Returns: {
              "avatar": string,"nickname": string,"total_earned": number,"total_spent": number,"user_id": string,"wallet_balance": number
            }[]
                           },
"get_friends_feed":
{ Args: Record<PropertyKey, never>; Returns: {
              "v_items": Json,"v_stats": Json
            }[]
                           },
"get_last_balance":
{ Args: { "p_user_id": string }; Returns: number
                           },
"get_my_achievements":
{ Args: Record<PropertyKey, never>; Returns: {
              "v_max_current_streak": number,"v_max_streak": number,"v_streak_badges": Json
            }[]
                           },
"get_my_checkin_activity":
{ Args: { "p_project_id": string }; Returns: {
              "checked_at": string,"checkin_date": string,"id": string,"is_makeup": boolean,"project_id": string,"status": Database["public"]['Enums']["checkin_attempt_status"],"user_id": string
            }[]
                           },
"get_my_friends":
{ Args: Record<PropertyKey, never>; Returns: {
              "avatar": string,"nickname": string,"streak": number,"today_completed": number,"today_total": number,"user_id": string
            }[]
                           },
"get_my_friendships":
{ Args: Record<PropertyKey, never>; Returns: {
              "avatar": string,"direction": string,"friendship_id": string,"nickname": string,"requested_at": string,"user_id": string
            }[]
                           },
"get_my_month_summary":
{ Args: { "p_month_start": string }; Returns: {
              "month_earned": number,"month_spent": number
            }[]
                           },
"get_my_obligation_start":
{ Args: { "p_project_id": string }; Returns: string
                           },
"get_my_profile":
{ Args: Record<PropertyKey, never>; Returns: {
              "avatar": string,"created_at": string,"id": string,"nickname": string,"profile_visibility": Database["public"]['Enums']["project_visibility"],"timezone": string,"total_earned": number,"total_penalty": number,"total_revoked": number,"total_spent": number,"updated_at": string,"wallet_balance": number
            }[]
                           },
"get_my_project_invitations":
{ Args: Record<PropertyKey, never>; Returns: {
              "color": string,"icon": string,"invited_by": string,"membership_id": string,"name": string,"owner_id": string,"project_id": string,"project_status": Database["public"]['Enums']["project_status"],"starts_at": string,"target_description": string
            }[]
                           },
"get_my_team_leaderboard":
{ Args: Record<PropertyKey, never>; Returns: {
              "member_count": number,"project_color": string,"project_icon": string,"project_id": string,"project_name": string,"team_balance": number
            }[]
                           },
"get_project_member_overview":
{ Args: { "p_project_id": string }; Returns: {
              "v_checkin_mode": Database["public"]['Enums']["checkin_mode_type"],"v_is_owner": boolean,"v_lifetime_budget": number,"v_max_members": number,"v_members": Json,"v_my_settlement_earned": number,"v_my_status": Database["public"]['Enums']["member_status"],"v_pool_per_settlement": number,"v_settlement_count": number,"v_team_streak": number,"v_today": string,"v_today_done": number,"v_today_total": number,"v_total_granted": number
            }[]
                           },
"get_today_checkin_status":
{ Args: Record<PropertyKey, never>; Returns: {
              "checked_at": string,"checkin_id": string,"deadline_at": string,"project_id": string,"reward_amount": number,"reward_earned": number,"reward_mode": Database["public"]['Enums']["reward_mode_type"],"reward_n_value": number,"today": string
            }[]
                           },
"get_user_today":
{ Args: { "p_user_id": string }; Returns: string
                           },
"get_visible_checkin_activity":
{ Args: { "p_project_id": string }; Returns: {
              "checked_at": string,"checkin_date": string,"id": string,"is_makeup": boolean,"project_id": string,"status": Database["public"]['Enums']["checkin_attempt_status"],"user_id": string
            }[]
                           },
"get_visible_project_summaries":
{ Args: Record<PropertyKey, never>; Returns: {
              "color": string,"current_streak": number,"icon": string,"id": string,"max_streak": number,"member_count": number,"name": string,"owner_id": string,"project_type": Database["public"]['Enums']["project_type"],"starts_at": string,"status": Database["public"]['Enums']["project_status"],"target_description": string,"today_done": number,"today_total": number,"v_current_progress": number,"v_target_count": number,"visibility": Database["public"]['Enums']["project_visibility"]
            }[]
                           },
"invite_project_member":
{ Args: { "p_project_id": string,"p_user_id": string }; Returns: string
                           },
"is_project_owner":
{ Args: { "p_project_id": string }; Returns: boolean
                           },
"nudge_friend":
{ Args: { "p_user_id": string }; Returns: undefined
                           },
"patch_project_details":
{ Args: { "p_patch": Json,"p_project_id": string }; Returns: undefined
                           },
"quit_project":
{ Args: { "p_project_id": string }; Returns: undefined
                           },
"record_expense":
{ Args: { "p_amount": number,"p_category"?: string,"p_expense_date"?: string,"p_note"?: string,"p_request_id"?: string }; Returns: string
                           },
"reject_friendship":
{ Args: { "p_friendship_id": string }; Returns: undefined
                           },
"reject_project_invitation":
{ Args: { "p_project_id": string }; Returns: undefined
                           },
"remove_project_member":
{ Args: { "p_project_id": string,"p_user_id": string }; Returns: undefined
                           },
"request_friendship":
{ Args: { "p_target_id": string }; Returns: string
                           },
"revoke_checkin":
{ Args: { "p_checkin_id": string,"p_reason"?: string }; Returns: undefined
                           },
"search_users":
{ Args: { "p_email": string }; Returns: {
              "avatar": string,"nickname": string,"relation": string,"user_id": string
            }[]
                           },
"toggle_activity_like":
{ Args: { "p_target_id": string,"p_target_type": string }; Returns: {
              "v_liked": boolean,"v_like_count": number
            }[]
                           },
"update_expense":
{ Args: { "p_category"?: string,"p_expense_date"?: string,"p_expense_id": string,"p_new_amount": number,"p_note"?: string }; Returns: undefined
                           },
"update_profile":
{ Args: { "p_avatar"?: string,"p_nickname"?: string,"p_timezone"?: string }; Returns: undefined
                           },
"update_profile_visibility":
{ Args: { "p_visibility": Database["public"]['Enums']["project_visibility"] }; Returns: undefined
                           }
          }
          Enums: {
            "achievement_type": "streak"|"badge"|"level","checkin_attempt_status": "active"|"revoked","checkin_mode_type": "any_one"|"all","friendship_status": "pending"|"accepted","makeup_reward_mode_type": "none"|"full"|"partial","makeup_type": "independent"|"shared","makeup_type_enum": "independent"|"shared","member_role": "owner"|"admin"|"member","member_status": "pending"|"active"|"quit"|"removed"|"expired","occurrence_status": "pending"|"checked"|"missed"|"makeup"|"revoked"|"exempted"|"penalty_capped"|"waived","project_frequency_type": "daily"|"weekly"|"custom","project_status": "pending"|"active"|"cancelled"|"archived","project_type": "personal"|"group","project_visibility": "private"|"friends"|"public","reward_mode_type": "every_time"|"every_n"|"completed","settlement_type_enum": "daily"|"milestone"|"completion","task_type": "infinite"|"finite","transaction_type": "reward"|"penalty"|"expense"|"adjustment"|"revoke"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "auth": {
          Enums: {
            "aal_level": ["aal1", "aal2", "aal3"],"code_challenge_method": ["s256", "plain"],"factor_status": ["unverified", "verified"],"factor_type": ["totp", "webauthn", "phone", "recovery_code"],"oauth_authorization_status": ["pending", "approved", "denied", "expired"],"oauth_client_type": ["public", "confidential"],"oauth_registration_type": ["dynamic", "manual"],"oauth_response_type": ["code"],"one_time_token_type": ["confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token"]
          }
        },"public": {
          Enums: {
            "achievement_type": ["streak", "badge", "level"],"checkin_attempt_status": ["active", "revoked"],"checkin_mode_type": ["any_one", "all"],"friendship_status": ["pending", "accepted"],"makeup_reward_mode_type": ["none", "full", "partial"],"makeup_type": ["independent", "shared"],"makeup_type_enum": ["independent", "shared"],"member_role": ["owner", "admin", "member"],"member_status": ["pending", "active", "quit", "removed", "expired"],"occurrence_status": ["pending", "checked", "missed", "makeup", "revoked", "exempted", "penalty_capped", "waived"],"project_frequency_type": ["daily", "weekly", "custom"],"project_status": ["pending", "active", "cancelled", "archived"],"project_type": ["personal", "group"],"project_visibility": ["private", "friends", "public"],"reward_mode_type": ["every_time", "every_n", "completed"],"settlement_type_enum": ["daily", "milestone", "completion"],"task_type": ["infinite", "finite"],"transaction_type": ["reward", "penalty", "expense", "adjustment", "revoke"]
          }
        }
} as const
