import {pick, cloneDeep} from 'lodash';
import swal from 'sweetalert';

class AppPreferencesMapping {
  constructor($uibModal, $state, MappingService, log) {
    'ngInject';
    this.log = log;
    this.log.initLocation('AppPreferencesMapping');
    this.$uibModal = $uibModal;
    this.$state = $state;
    this.MappingService = MappingService;
    this.smartTable = {
      options: {
        pagination: '',
        items_by_page: 10,
        displayed_pages: 7,
      },
    };
  }

  $onInit() {
  }

  addMapping() {
    
    var mapping = {    
        correlation_mapping_source: [],
        create_index: {},
        create_table: "CREATE TABLE",
        fields_mapping_source: [],
        hep_alias: "NEW",        
        hepid: 10,
        mapping_settings: null,
        partid: 10,
        partition_step: 10,
        profile: "rest",
        retention: 10,
        version: 1,
        schema_mapping: {},
        schema_settings: {},
    }
    
    this.$uibModal.open({
      component: 'appPreferencesMappingAddEdit',
      resolve: {
        mapping: () => {            
          return cloneDeep(mapping);
        },
      },
                                      
    }).result.then((mapping) => {
      mapping.correlation_mapping = JSON.parse(mapping.correlation_mapping_source);
      mapping.fields_mapping = JSON.parse(mapping.fields_mapping_source);
      delete mapping.correlation_mapping_source;
      delete mapping.fields_mapping_source;           
      this.addMappingToStorage(mapping);
    });
  }

  editMapping(mapping) {
  
    mapping.correlation_mapping_source = JSON.stringify(mapping.correlation_mapping, null, 2);
    mapping.fields_mapping_source = JSON.stringify(mapping.fields_mapping, null, 2);
  
    this.$uibModal.open({
      component: 'appPreferencesMappingAddEdit',
      resolve: {
        mapping: () => {           
          return cloneDeep(mapping);
        },
      },
    }).result.then((mapping) => {
      mapping.correlation_mapping = JSON.parse(mapping.correlation_mapping_source);
      mapping.fields_mapping = JSON.parse(mapping.fields_mapping_source);
      delete mapping.correlation_mapping_source;
      delete mapping.fields_mapping_source;           
      console.log("SSS", mapping);
      this.updateMappingInStorage(mapping);
    });
  }

  async deleteMapping(mapping) {
  
    if(mapping.guid == null) mapping.guid = "abvgdec12346833";

    const mustDelete = await swal({
      icon: 'warning',
      title: 'Delete mapping ['+mapping.guid+'] ?',
      text: 'Once deleted, you will not be able to recover this!',
      buttons: true,
      dangerMode: true,
    });

    if (mustDelete) {
      try {      
        await this.MappingService.delete(mapping.guid);
        this._tableMappingDelete(mapping);
      } catch (err) {
        this.log.error(err.message);
      }
    }
  }

  async updateMappingInStorage(mapping) {
    if (!mapping) {
      this.log.warn('no mapping was updated by modal');
      return;
    }

    try {
      const data = pick(mapping, ['guid', 'profile', 'hepid', 'hep_alias', 'partid','version','retention','partition_step','create_index','create_table','correlation_mapping','fields_mapping','mapping_settings','schema_mapping','schema_settings']);      
      
      await this.MappingService.update(data);
      this._tableMappingUpdate();
    } catch (err) {
      this.log.error(err.message);
    }
  }

  async addMappingToStorage(mapping) {
    if (!mapping) {
      this.log.warn('no mapping was added by modal');
      return;
    }

    try {
      const data = pick(mapping, ['guid', 'profile', 'hepid', 'hep_alias', 'partid','version','retention','partition_step','create_index','create_table','correlation_mapping','fields_mapping','mapping_settings','schema_mapping','schema_settings']);      
      await this.MappingService.add(data);
      this._tableMappingAdd(mapping);
    } catch (err) {
      this.log.error(err.message);
    }
  }

  _tableMappingDelete(mapping) {
    this.mappings.splice(this.mappings.findIndex((u) => u.guid === mapping.guid), 1);
    this._reloadThisState();
  }

  _tableMappingAdd(mapping) {
    this.mappings.push(mapping);
    this._reloadThisState();
  }

  _tableMappingUpdate() {
    this._reloadThisState();
  }

  _reloadThisState() {
    //this.$state.reload();
    this.$state.transitionTo(this.$state.current, this.$state.params, { 
      reload: true, inherit: false, notify: true
    });
  }
}

export default AppPreferencesMapping;
