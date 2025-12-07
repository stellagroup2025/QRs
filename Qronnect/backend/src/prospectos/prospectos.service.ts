import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProspectosService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private getClient() {
        return this.supabaseService.getAdminClient();
    }

    async findAll(comercialId: string) {
        const { data, error } = await this.getClient()
            .from('prospectos')
            .select('*')
            .eq('comercial_id', comercialId)
            .order('created_at', { ascending: false });

        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async create(comercialId: string, payload: any) {
        const { data, error } = await this.getClient()
            .from('prospectos')
            .insert({ ...payload, comercial_id: comercialId })
            .select()
            .single();

        if (error) throw new InternalServerErrorException(error.message);
        return data;
    }

    async update(id: string, comercialId: string, payload: any) {
        // Ensure the commercial owns the prospect
        const { error } = await this.getClient()
            .from('prospectos')
            .update(payload)
            .eq('id', id)
            .eq('comercial_id', comercialId);

        if (error) throw new InternalServerErrorException(error.message);
        return { success: true };
    }
}
