<!--  -->
<template>
<div class=''>
  <!-- 面包屑导航 -->
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>权限列表</el-breadcrumb-item>
  </el-breadcrumb>

  <!-- 卡片视图 -->
  <el-card>
    <el-table :data="rightsList" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column lable="权限名称" prop="authName"></el-table-column>
      <el-table-column lable="路径" prop="path"></el-table-column>
      <el-table-column lable="权限等级" prop="level">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.level === '0'">一级权限</el-tag>
          <el-tag type="success" v-else-if="scope.row.level === '1'">二级权限</el-tag>
          <el-tag type="warning" v-else>二级权限</el-tag>
        </template>
      </el-table-column>

    </el-table>
  </el-card>
</div>
</template>

<script>

export default {
  components: {},
  data() {
    return {
      //所有的权限列表
      rightsList:[]
    };
  },
  created() {
    //获取所有的权限
    this.getRightsList()
  },
  methods: {
    async getRightsList() {
      const {data:res} = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsList = res.data
      console.log(this.rightsList)
    }
  }
}
</script>
<style lang='stylus' ref='stylessheet/stylus'>

</style>