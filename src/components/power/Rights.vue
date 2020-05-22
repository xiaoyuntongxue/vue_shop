<template>
 <div>
    <!-- 头部面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 内容主体区域 -->
    <el-card>
      <!-- 权限列表 -->
      <el-table :data="rightsList" border stripe>
        <!-- 插入序号列 -->
        <el-table-column type="index" label="序号" width="100px"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
 </div>
</template>

<script>
  export default {
    name: 'Rights',
    data() {
      return {
        // 权限名称
        authName: '',
        // 路径
        path: '',
        // 权限等级
        level: '',
        // 所有的权限数据
        rightsList: []
      }
    },
    created() {
      this.getRightsList();
    },
    methods: {
      // 获取权限列表的内容
      async getRightsList() {
        const {data: res} = await this.$http.get('rights/list')
        if (res.meta.status !== 200) {
          return this.$message.error('获取权限列表失败!');         
        }
        this.rightsList = res.data;
        // console.log(this.rightsList);
        
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-breadcrumb {
    margin-bottom: 15px;
    font-size: 12px;
  }
</style>