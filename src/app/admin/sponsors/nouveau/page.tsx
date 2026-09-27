import { createClient } from '@/lib/supabase/server';
import SponsorForm from '../SponsorForm';

export default async function NewSponsorPage({
  searchParams
}: {
  searchParams: Promise<{ from_request?: string }>;
}) {
  const { from_request } = await searchParams;

  // Si on crée depuis une demande de partenariat validée → charger les données
  let prefilled: any = null;

  if (from_request) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('sponsor_requests')
      .select('*')
      .eq('id', from_request)
      .eq('status', 'validated')
      .single();

    if (data) {
      prefilled = {
        name: data.company_name,
        slug: (data.company_name ?? '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
        tier: 'official',
        logo_url: '',
        website_url: data.website_url ?? '',
        sector_fr: data.sector ?? '',
        sector_en: '',
        description_fr: data.message ?? '',
        description_en: '',
        long_description_fr: '',
        long_description_en: '',
        is_active: true,
        sort_order: 99,
        // Passé en props pour la note
        _fromRequest: true
      };
    }
  }

  return <SponsorForm sponsor={prefilled} />;
}