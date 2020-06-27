<!--  -->
<template>
<div class=''>
   <!-- 面包屑导航 -->
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图 -->
  <el-card>
    <el-row>
      <el-col>
        <el-button type="primary">添加角色</el-button>
      </el-col>
    </el-row>
    <!-- 角色列表 -->
    <el-table :data="roleList" border stripe>
      <!-- 展开列 -->
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-row :class="['bdbottom',i1 === 0 ? 'bdtop' : '','vecenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
            <!-- 渲染一级权限 -->
            <el-col :span="5">
              <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 渲染二级和三级权限 -->
            <el-col :span="19">
              <!-- 通过for循环嵌套渲染二级权限 -->
              <el-row :class="[i2 === 0 ? '' : 'bdtop','vecenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                <el-col :span="6">
                  <el-tag closable @close="removeRightById(scope.row,item2.id)" type="success">{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="18">
                  <el-tag closable @close="removeRightById(scope.row,item3.id)" type="warning" v-for="(item3,i3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <!-- 索引列 -->
      <el-table-column type="index"></el-table-column>
      <el-table-column lable="角色名称" prop="roleName"></el-table-column>
      <el-table-column lable="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column lable="操作" width="300px">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
          <el-button type="warning" @click="showSetRightDialog(scope.row)" size="mini" icon="el-icon-setting">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <el-dialog
  title="分配权限"
  :visible.sync="setRightDialogVisible"
  width="50%" @close="setRightDialogClosed">
    <!-- 树形控件 -->
    <el-tree ref="treeRef" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" :data="rightsList" :props="treeProps" ></el-tree>
    <span slot="footer" class="dialog-footer">
      <el-button @click="setRightDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="allotRights">确 定</el-button>
    </span>
  </el-dialog>
</div>
</template>

<script>

export default {
  components: {},
  data() {
    return {
      roleList:[],
      //控制分配权限对话框
      setRightDialogVisible:false,
      //所有权限的数据
      rightsList:[],
      //树形控件
      treeProps:{
        label:'authName',
        children:'children'
      },
      defKeys:[],
      //即将分配权限的ID
      roleId:''
    };
  },
  created() {
    this.getRolesList()
  },
  methods: {
    //获取所有角色的列表
    async getRolesList() {
      const {data:res} = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      console.log(this.roleList)
    },
    //根据id删除对应的权限
    async removeRightById(role,rightId) {
      //弹框提示用户是否要删除
      const confirmResult = await this.$confirm('是否要删除','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type:"warning"
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // this.getRolesList()
      role.children = res.data
    },
    //展示分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      const {data:res} = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      //把获取到的权限数据保存到data中
      this.rightsList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    //通过递归的形式，获取角色下所有三级权限的id，并保存到defkeys数组中
    getLeafKeys(node,arr) {
      if (!node.children) {
        //如果当前node节点不包含children属性，则是三级节点
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    //监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    //点击角色分配
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败') 
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang='less' scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}
.vecenter {
  display: flex;
  align-items: center;
}
</style>