import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../api/profile.service';
export function useProfile() { return useQuery({ queryKey: ['profile'], queryFn: profileService.get, staleTime: 60_000 }); }
export function useAllergens() { return useQuery({ queryKey: ['profile-allergens'], queryFn: profileService.getAllergens, staleTime: 60_000 }); }
export function useUpdateProfile() { const client = useQueryClient(); return useMutation({ mutationFn: profileService.update, onSuccess: (data) => { client.setQueryData(['profile'], data); } }); }
export function useSetAllergens() { const client = useQueryClient(); return useMutation({ mutationFn: profileService.setAllergens, onSuccess: (_, allergens) => { client.setQueryData(['profile-allergens'], allergens); } }); }
