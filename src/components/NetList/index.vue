<template lang="html">
    <div class="mo-net-list">
        <el-table :data="NetList" stripe style="width: 100%; min-width: 700px;"
            highlight-current-row @current-change="handleCurrentChange">
            <el-table-column prop="url" label="URL">
            </el-table-column>
            <el-table-column prop="method" label="methond" width="100" align="center">
            </el-table-column>
            <el-table-column prop="statusCode" label="status" width="80" align="center">
            </el-table-column>
            <el-table-column prop="mime" label="mime" width="150" align="center">
            </el-table-column>
            <el-table-column prop="length" label="length" width="80" align="center">
            </el-table-column>
            <el-table-column prop="duration" label="time(ms)" width="100" align="center">
            </el-table-column>
            <el-table-column prop="rule" label="rule" width="100" align="center">
            </el-table-column>
          </el-table>
          <net-list-item v-drag-width :item="currentRow" :resDownload="resDownload" :res-body="resBody" :isShow="isShowItem" @close="isShowItem=false"></net-list-item>
    </div>
</template>

<script>
import NetListItem from './NetListItem/index';
import dragWidth from '../../directives/drag_width';
import { mapGetters } from 'vuex';
export default {
    name: 'net-list',
    components: {
      NetListItem
    },
    data() {
      return {
        isShowItem: false,
        resBody: '',
        resDownload: {
        },
        currentRow: {}
      }
    },
    computed: {
        ...mapGetters([
            'NetList'
        ])
    },
    methods: {
        handleCurrentChange(row) {
            if(!row) return;
            this.currentRow = row;
            this.isShowItem = true;
            this.$http.get('/api/fetchBody', {
                params: {id: row.id}
            }).then(res => {
                if(res.status != 200) return;
                if(res.data && res.data.resBody) {
                    this.resBody = res.data && res.data.resBody;
                } else {
                    this.resBody = '';
                    this.resDownload = res.data;
                }
            }).catch(error => {
                this.resBody = "请求出错！";
            })
        }
    }
}
</script>

<style lang="css">
.mo-net-list .el-table tr:hover {
    cursor: pointer;
}
</style>
