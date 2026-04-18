/**
 * Serviço para gerenciar perfis públicos dos usuários
 * Endpoints: /api/profiles
 */

import {
  ProfileTag,
  AdvancedCycleInfo,
  DisciplinaAvancado,
  PostCMInfo,
  InternationalExperience,
} from "@/types/publicProfile";

// ================ TIPOS ================

export interface ProfileData {
  id?: number;
  user_id: number;
  bio?: string;
  citacao?: string;
  citacao_autor?: string;
  avatar?: string;
  banner_choice?: string;
  turma?: string;
  curso_origem?: string;
  area_interesse?: string;
  email_publico?: string;
  linkedin?: string;
  lattes?: string;
  github?: string;
  site_pessoal?: string;
  site?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompleteProfile extends ProfileData {
    site?: string;
  nome?: string;
  profileImage?: string;
  advanced_cycles?: AdvancedCycleWithTags[];
  disciplines?: DisciplinaAvancado[];
  international_experiences?: InternationalExperience[];
  post_cm?: PostCMWithAreas[];
  tags?: ProfileTag[];
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

export interface AdvancedCycleWithTags extends AdvancedCycleInfo {
  tags?: ProfileTag[];
}

export interface PostCMWithAreas extends PostCMInfo {
  areas?: ProfileTag[];
}

export interface FollowUser {
  id: number;
  nome: string;
  turma?: string;
  avatar?: string;
}

export interface FollowCounts {
  followers: number;
  following: number;
}

// ================ SERVICE ================

class ProfileService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  private getMultipartAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  // ==================== PERFIL BÁSICO ====================

  /**
   * Busca perfil completo do usuário (público ou próprio)
   */
  async getProfile(userId: number): Promise<CompleteProfile> {
    console.log(`🔵 [ProfileService] Buscando perfil do usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 404) throw new Error('Perfil não encontrado');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const profile = await response.json();
      console.log('🟢 [ProfileService] Perfil carregado com sucesso');
      console.log('🔍 [ProfileService] Profile completo:', JSON.stringify(profile, null, 2));
      console.log('🔍 [ProfileService] banner_choice recebido:', profile.banner_choice);
      return profile;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao buscar perfil:', error);
      throw error;
    }
  }

  /**
   * Atualiza informações básicas do perfil
   */
  async updateProfile(userId: number, data: Partial<ProfileData>): Promise<ProfileData> {
    console.log(`🔵 [ProfileService] Atualizando perfil do usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        if (response.status === 404) throw new Error('Perfil não encontrado');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const profile = await response.json();
      console.log('🟢 [ProfileService] Perfil atualizado com sucesso');
      return profile;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Atualiza escolha do banner (6 opções predefinidas)
   */
  async updateBanner(userId: number, bannerChoice: string): Promise<void> {
    console.log(`🔵 [ProfileService] Atualizando banner para ${bannerChoice}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/banner`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ bannerChoice })
      });
      if (!response.ok) {
        if (response.status === 400) throw new Error('Escolha de banner inválida');
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Banner atualizado com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao atualizar banner:', error);
      throw error;
    }
  }

  /**
   * Upload de avatar (imagem, max 5MB)
   */
  async uploadAvatar(userId: number, imageFile: File): Promise<{ avatar_path: string }> {
    console.log(`🔵 [ProfileService] Fazendo upload de avatar para usuário ${userId}`);
    console.log(`🔵 [ProfileService] Arquivo:`, imageFile.name, imageFile.size, "bytes", imageFile.type);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      console.log(`🔵 [ProfileService] Enviando PUT para /api/profiles/${userId}/avatar`);

      const response = await fetch(`/api/profiles/${userId}/avatar`, {
        method: 'PUT',
        headers: this.getMultipartAuthHeaders(),
        body: formData
      });
      
      console.log(`🔵 [ProfileService] Resposta:`, response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🔴 [ProfileService] Erro na resposta:`, errorText);
        if (response.status === 400) throw new Error('Arquivo inválido (máx 5MB, PNG/JPG)');
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log('🟢 [ProfileService] Avatar enviado com sucesso:', data);
      return data;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao fazer upload de avatar:', error);
      throw error;
    }
  }

  /**
   * Selecionar avatar padrão
   */
  async selectDefaultAvatar(userId: number, imagePath: string): Promise<{ profile_image: string }> {
    console.log(`🔵 [ProfileService] Selecionando avatar padrão: ${imagePath}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/avatar/default`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ imagePath })
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log('🟢 [ProfileService] Avatar padrão selecionado com sucesso');
      return data;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao selecionar avatar padrão:', error);
      throw error;
    }
  }

  async getSandboxRosterOptions(userId: number): Promise<{ success: boolean; turma: string; students: string[]; error?: string }> {
    console.log(`🔵 [ProfileService] Buscando roster options para usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/publish-sandbox/roster-options`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || `Erro HTTP: ${response.status}`);
      }

      return payload;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao buscar roster options:', error);
      throw error;
    }
  }

  /**
   * Publica perfil no repositorio sandbox e cria PR via backend.
   */
  async publishSandbox(userId: number, selectedRosterName: string): Promise<{ success: boolean; prUrl?: string; branchName?: string; noChanges?: boolean; filesChanged?: string[]; error?: string }> {
    console.log(`🔵 [ProfileService] Publicando perfil em sandbox para usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/publish-sandbox`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ selectedRosterName })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || `Erro HTTP: ${response.status}`);
      }

      console.log('🟢 [ProfileService] Publicação sandbox concluída');
      return payload;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro na publicação sandbox:', error);
      throw error;
    }
  }

  // ==================== CICLOS AVANÇADOS ====================

  /**
   * Busca todos os ciclos avançados de um perfil
   */
  async getAdvancedCycles(userId: number): Promise<AdvancedCycleWithTags[]> {
    console.log(`🔵 [ProfileService] Buscando ciclos avançados do usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/advanced-cycles`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const cycles = await response.json();
      console.log(`🟢 [ProfileService] ${cycles.length} ciclos encontrados`);
      return cycles;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao buscar ciclos:', error);
      throw error;
    }
  }

  /**
   * Cria novo ciclo avançado
   */
  async createAdvancedCycle(userId: number, data: Partial<AdvancedCycleInfo>): Promise<AdvancedCycleInfo> {
    console.log(`🔵 [ProfileService] Criando ciclo avançado`);
    try {
      const response = await fetch(`/api/profiles/${userId}/advanced-cycles`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const cycle = await response.json();
      console.log('🟢 [ProfileService] Ciclo criado com sucesso');
      return cycle;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao criar ciclo:', error);
      throw error;
    }
  }

  /**
   * Atualiza ciclo avançado existente
   */
  async updateAdvancedCycle(userId: number, cycleId: number, data: Partial<AdvancedCycleInfo>): Promise<AdvancedCycleInfo> {
    console.log(`🔵 [ProfileService] Atualizando ciclo ${cycleId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/advanced-cycles/${cycleId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        if (response.status === 404) throw new Error('Ciclo não encontrado');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const cycle = await response.json();
      console.log('🟢 [ProfileService] Ciclo atualizado com sucesso');
      return cycle;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao atualizar ciclo:', error);
      throw error;
    }
  }

  /**
   * Remove ciclo avançado
   */
  async deleteAdvancedCycle(userId: number, cycleId: number): Promise<void> {
    console.log(`🔵 [ProfileService] Removendo ciclo ${cycleId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/advanced-cycles/${cycleId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        if (response.status === 404) throw new Error('Ciclo não encontrado');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Ciclo removido com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao remover ciclo:', error);
      throw error;
    }
  }

  /**
   * Adiciona tag a um ciclo (máx 5: 2 área + 3 subárea)
   */
  async addCycleTag(userId: number, cycleId: number, label: string, category: string): Promise<void> {
    console.log(`🔵 [ProfileService] Adicionando tag ao ciclo ${cycleId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/advanced-cycles/${cycleId}/tags`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ label, category })
      });
      if (!response.ok) {
        if (response.status === 400) {
          const error = await response.json();
          throw new Error(error.error || 'Limite de tags atingido');
        }
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Tag adicionada com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao adicionar tag:', error);
      throw error;
    }
  }

  /**
   * Remove tag de um ciclo
   */
  async removeCycleTag(userId: number, cycleId: number, tagId: number): Promise<void> {
    console.log(`🔵 [ProfileService] Removendo tag ${tagId} do ciclo ${cycleId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/advanced-cycles/${cycleId}/tags/${tagId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Tag removida com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao remover tag:', error);
      throw error;
    }
  }

  // ==================== DISCIPLINAS ====================

  /**
   * Busca todas as disciplinas de um perfil
   */
  async getDisciplines(userId: number): Promise<DisciplinaAvancado[]> {
    console.log(`🔵 [ProfileService] Buscando disciplinas do usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/disciplines`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const disciplines = await response.json();
      console.log(`🟢 [ProfileService] ${disciplines.length} disciplinas encontradas`);
      return disciplines;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao buscar disciplinas:', error);
      throw error;
    }
  }

  /**
   * Cria nova disciplina
   */
  async createDiscipline(userId: number, data: Partial<DisciplinaAvancado>): Promise<DisciplinaAvancado> {
    console.log(`🔵 [ProfileService] Criando disciplina`);
    try {
      const response = await fetch(`/api/profiles/${userId}/disciplines`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const discipline = await response.json();
      console.log('🟢 [ProfileService] Disciplina criada com sucesso');
      return discipline;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao criar disciplina:', error);
      throw error;
    }
  }

  /**
   * Atualiza disciplina existente
   */
  async updateDiscipline(userId: number, disciplineId: number, data: Partial<DisciplinaAvancado>): Promise<DisciplinaAvancado> {
    console.log(`🔵 [ProfileService] Atualizando disciplina ${disciplineId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/disciplines/${disciplineId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        if (response.status === 404) throw new Error('Disciplina não encontrada');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const discipline = await response.json();
      console.log('🟢 [ProfileService] Disciplina atualizada com sucesso');
      return discipline;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao atualizar disciplina:', error);
      throw error;
    }
  }

  /**
   * Remove disciplina
   */
  async deleteDiscipline(userId: number, disciplineId: number): Promise<void> {
    console.log(`🔵 [ProfileService] Removendo disciplina ${disciplineId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/disciplines/${disciplineId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        if (response.status === 404) throw new Error('Disciplina não encontrada');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Disciplina removida com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao remover disciplina:', error);
      throw error;
    }
  }

  // ==================== EXPERIÊNCIAS INTERNACIONAIS ====================

  /**
   * Busca todas as experiências internacionais de um perfil
   */
  async getInternationalExperiences(userId: number): Promise<InternationalExperience[]> {
    console.log(`🔵 [ProfileService] Buscando experiências internacionais do usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/international`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const experiences = await response.json();
      console.log(`🟢 [ProfileService] ${experiences.length} experiências encontradas`);
      return experiences;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao buscar experiências:', error);
      throw error;
    }
  }

  /**
   * Cria nova experiência internacional
   */
  async createInternationalExperience(userId: number, data: Partial<InternationalExperience>): Promise<InternationalExperience> {
    console.log(`🔵 [ProfileService] Criando experiência internacional`);
    try {
      const response = await fetch(`/api/profiles/${userId}/international`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const experience = await response.json();
      console.log('🟢 [ProfileService] Experiência criada com sucesso');
      return experience;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao criar experiência:', error);
      throw error;
    }
  }

  /**
   * Atualiza experiência internacional existente
   */
  async updateInternationalExperience(userId: number, experienceId: number, data: Partial<InternationalExperience>): Promise<InternationalExperience> {
    console.log(`🔵 [ProfileService] Atualizando experiência ${experienceId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/international/${experienceId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        if (response.status === 404) throw new Error('Experiência não encontrada');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const experience = await response.json();
      console.log('🟢 [ProfileService] Experiência atualizada com sucesso');
      return experience;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao atualizar experiência:', error);
      throw error;
    }
  }

  /**
   * Remove experiência internacional
   */
  async deleteInternationalExperience(userId: number, experienceId: number): Promise<void> {
    console.log(`🔵 [ProfileService] Removendo experiência ${experienceId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/international/${experienceId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        if (response.status === 404) throw new Error('Experiência não encontrada');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Experiência removida com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao remover experiência:', error);
      throw error;
    }
  }

  // ==================== PÓS-CM ====================

  /**
   * Busca todas as entradas pós-CM de um perfil
   */
  async getPostCM(userId: number): Promise<PostCMWithAreas[]> {
    console.log(`🔵 [ProfileService] Buscando entradas pós-CM do usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/post-cm`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const postCm = await response.json();
      console.log(`🟢 [ProfileService] ${postCm.length} entradas encontradas`);
      return postCm;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao buscar pós-CM:', error);
      throw error;
    }
  }

  /**
   * Cria nova entrada pós-CM
   */
  async createPostCM(userId: number, data: Partial<PostCMInfo>): Promise<PostCMInfo> {
    console.log(`🔵 [ProfileService] Criando entrada pós-CM`);
    try {
      const response = await fetch(`/api/profiles/${userId}/post-cm`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const postCm = await response.json();
      console.log('🟢 [ProfileService] Pós-CM criado com sucesso');
      return postCm;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao criar pós-CM:', error);
      throw error;
    }
  }

  /**
   * Atualiza entrada pós-CM existente
   */
  async updatePostCM(userId: number, postCmId: number, data: Partial<PostCMInfo>): Promise<PostCMInfo> {
    console.log(`🔵 [ProfileService] Atualizando pós-CM ${postCmId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/post-cm/${postCmId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        if (response.status === 404) throw new Error('Pós-CM não encontrado');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const postCm = await response.json();
      console.log('🟢 [ProfileService] Pós-CM atualizado com sucesso');
      return postCm;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao atualizar pós-CM:', error);
      throw error;
    }
  }

  /**
   * Remove entrada pós-CM
   */
  async deletePostCM(userId: number, postCmId: number): Promise<void> {
    console.log(`🔵 [ProfileService] Removendo pós-CM ${postCmId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/post-cm/${postCmId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        if (response.status === 404) throw new Error('Pós-CM não encontrado');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Pós-CM removido com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao remover pós-CM:', error);
      throw error;
    }
  }

  /**
   * Adiciona área a uma entrada pós-CM
   */
  async addPostCMArea(userId: number, postCmId: number, label: string, category: string): Promise<void> {
    console.log(`🔵 [ProfileService] Adicionando área ao pós-CM ${postCmId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/post-cm/${postCmId}/areas`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ label, category })
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Área adicionada com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao adicionar área:', error);
      throw error;
    }
  }

  /**
   * Remove área de uma entrada pós-CM
   */
  async removePostCMArea(userId: number, postCmId: number, areaId: number): Promise<void> {
    console.log(`🔵 [ProfileService] Removendo área ${areaId} do pós-CM ${postCmId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/post-cm/${postCmId}/areas/${areaId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Área removida com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao remover área:', error);
      throw error;
    }
  }

  // ==================== TAGS DO PERFIL ====================

  /**
   * Busca todas as tags de um perfil
   */
  async getProfileTags(userId: number, category?: string): Promise<ProfileTag[]> {
    console.log(`🔵 [ProfileService] Buscando tags do usuário ${userId}`);
    try {
      const url = category 
        ? `/api/profiles/${userId}/tags?category=${category}`
        : `/api/profiles/${userId}/tags`;
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const tags = await response.json();
      console.log(`🟢 [ProfileService] ${tags.length} tags encontradas`);
      return tags;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao buscar tags:', error);
      throw error;
    }
  }

  /**
   * Adiciona tag ao perfil (máx 9 totais)
   */
  async addProfileTag(userId: number, label: string, category: string): Promise<void> {
    console.log(`🔵 [ProfileService] Adicionando tag ao perfil`);
    try {
      const response = await fetch(`/api/profiles/${userId}/tags`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ label, category })
      });
      if (!response.ok) {
        if (response.status === 400) {
          const error = await response.json();
          throw new Error(error.error || 'Limite de tags atingido');
        }
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Tag adicionada com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao adicionar tag:', error);
      throw error;
    }
  }

  /**
   * Remove tag do perfil
   */
  async removeProfileTag(userId: number, tagId: number): Promise<void> {
    console.log(`🔵 [ProfileService] Removendo tag ${tagId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/tags/${tagId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('Sem permissão para editar este perfil');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Tag removida com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao remover tag:', error);
      throw error;
    }
  }

  // ==================== SISTEMA DE FOLLOW ====================

  /**
   * Seguir um usuário
   */
  async followUser(userId: number): Promise<void> {
    console.log(`🔵 [ProfileService] Seguindo usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/follow`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 400) throw new Error('Você já segue este usuário');
        if (response.status === 403) throw new Error('Não é possível seguir a si mesmo');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Usuário seguido com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao seguir usuário:', error);
      throw error;
    }
  }

  /**
   * Deixar de seguir um usuário
   */
  async unfollowUser(userId: number): Promise<void> {
    console.log(`🔵 [ProfileService] Deixando de seguir usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/follow`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 400) throw new Error('Você não segue este usuário');
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      console.log('🟢 [ProfileService] Deixou de seguir com sucesso');
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao deixar de seguir:', error);
      throw error;
    }
  }

  /**
   * Busca seguidores de um usuário
   */
  async getFollowers(userId: number): Promise<FollowUser[]> {
    console.log(`🔵 [ProfileService] Buscando seguidores do usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/followers`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const followers = await response.json();
      console.log(`🟢 [ProfileService] ${followers.length} seguidores encontrados`);
      return followers;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao buscar seguidores:', error);
      throw error;
    }
  }

  /**
   * Busca usuários que o usuário segue
   */
  async getFollowing(userId: number): Promise<FollowUser[]> {
    console.log(`🔵 [ProfileService] Buscando seguindo do usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/following`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const following = await response.json();
      console.log(`🟢 [ProfileService] Seguindo ${following.length} usuários`);
      return following;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao buscar seguindo:', error);
      throw error;
    }
  }

  /**
   * Busca contadores de seguidores/seguindo
   */
  async getFollowCounts(userId: number): Promise<FollowCounts> {
    console.log(`🔵 [ProfileService] Buscando contadores de follow do usuário ${userId}`);
    try {
      const response = await fetch(`/api/profiles/${userId}/follow-counts`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      const counts = await response.json();
      console.log('🟢 [ProfileService] Contadores obtidos com sucesso');
      return counts;
    } catch (error) {
      console.error('🔴 [ProfileService] Erro ao buscar contadores:', error);
      throw error;
    }
  }
}

export default new ProfileService();
