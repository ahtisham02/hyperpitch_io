import apiRequestAI from './apiRequestAI.js';
import { store } from '../store/store';
import { API_ENDPOINTS } from '../config/api.js';

const sectionApiService = {
  async updateSection(sessionId, sectionName, html, position = 'at_beginning', refSection = '', action = 'update') {
    try {
      const token = store.getState().auth.userToken;
      const response = await apiRequestAI('post', API_ENDPOINTS.UPDATE_SECTION, {
        session_id: sessionId,
        section_name: sectionName,
        html: html,
        position: position,
        ref_section: refSection,
        action: action
      }, token);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async addSection(sessionId, sectionName, html, position = 'at_beginning', refSection = '') {
    try {
      const token = store.getState().auth.userToken;
      const response = await apiRequestAI('post', API_ENDPOINTS.ADD_SECTION, {
        session_id: sessionId,
        section_name: sectionName,
        html: html,
        position: position,
        ref_section: refSection
      }, token);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async removeSection(sessionId, sectionName) {
    try {
      const token = store.getState().auth.userToken;
      const response = await apiRequestAI('post', API_ENDPOINTS.REMOVE_SECTION, {
        session_id: sessionId,
        section_name: sectionName
      }, token);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async moveSection(sessionId, sectionName, newPosition = 'at_beginning', refSection = '') {
    try {
      const token = store.getState().auth.userToken;
      const response = await apiRequestAI('post', API_ENDPOINTS.MOVE_SECTION, {
        session_id: sessionId,
        section_name: sectionName,
        new_position: newPosition,
        ref_section: refSection
      }, token);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async hostPage(files, projectName = null, useVercelDefault = false, urlPrefix = null) {
    try {
      const token = store.getState().auth.userToken;
      const formData = new FormData();
      
      if (Array.isArray(files)) {
        files.forEach(file => {
          formData.append('files', file);
        });
      } else {
        formData.append('files', files);
      }
      
      if (projectName) {
        formData.append('project_name', projectName);
      }
      
      formData.append('use_vercel_default', useVercelDefault);
      
      if (urlPrefix) {
        formData.append('url_prefix', urlPrefix);
      }

      const response = await apiRequestAI('post', API_ENDPOINTS.HOST_PAGE, formData, token, {
        'Content-Type': 'multipart/form-data',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default sectionApiService;
