import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PlanesService {
    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll() {
        const { data, error } = await this.supabaseService.getAdminClient()
            .from('planes')
            .select('*')
            .eq('activo', true)
            .order('precio', { ascending: true });

        if (error) throw error;
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabaseService.getAdminClient()
            .from('planes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }
}
