<!--  -->
<template>
<div>
  <!-- 面包屑 -->
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品分类</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图 -->
  <el-card>
    <el-row>
      <el-col>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-col>
    </el-row>
    <!-- 表格 -->
    <tree-table class="treeTable" 
    :data="catelist" 
    :columns="columns" 
    :selection-type="false" 
    :expand-type="false" 
    show-index index-text="#" border 
    :show-row-hover="false">
    <!-- 是否有效 -->
      <template slot="isok" slot-scope="scope">
        <i class="el-icon-success" style="color:lightgreen;" v-if="scope.row.cat_deleted === false"></i>
        <i class="el-icon-error" style="color:red;" v-else></i>
      </template>
       <!-- 排序 -->
      <template slot="order" slot-scope="scope">
        <el-tag v-if="scope.row.cat_level === 0" size="muni">一级</el-tag>    
        <el-tag v-else-if="scope.row.cat_level === 1" size="muni" type="success">二级</el-tag>    
        <el-tag v-else size="muni" type="warning">三级</el-tag>    
      </template>
      <!-- 操作 -->
      <template slot="opt" slot-scope="scope">
        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
      </template>
    </tree-table>
    <!-- 分页区 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-card>

  <!-- 添加分类的对话框 -->
  <el-dialog
  title="添加分类"
  :visible.sync="addCateDialogVisible"
  width="50%" @close="addCateDialogClosed">
  <!-- 添加分类的表单 -->
  <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px" > 
    <el-form-item label="分类名称：" prop="cat_name">
      <el-input v-model="addCateForm.cat_name"></el-input>
    </el-form-item>
    <el-form-item label="父级名称：">
      <el-cascader
        v-model="selectedKeys"
        :options="parentCateList"
        @change="parentCateChanged" :props="cascaderProps" clearable change-on-select>

      </el-cascader>
    </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取消</el-button>
    <el-button type="primary" @click="addCate">确定</el-button>
  </span>
</el-dialog>
</div>
</template>

<script>

export default {
  components: {},
  data() {
    return {
      //查询条件
      queryInfo: {
        type:3,
        pagenum:1,
        pagesize:5
      },
      total:0,
      //商品分类的数据列表
      catelist:[],
      parentCateList:[],
      cascaderProps:{
        label: 'cat_name',
        value: 'cat_id',
        children:'children'
      },
      selectedKeys:[],
      columns:[{
        label:'分类名称',
        prop:'cat_name'
      },
      {
        label:'是否有效',
        //表示 将当前列定义为模板列
        type:'template',
        //表示当前这一列使用模板名称
        template:'isok'
      },{
        label:'排序',
        //表示 将当前列定义为模板列
        type:'template',
        //表示当前这一列使用模板名称
        template:'order'
      },{
        label:'操作',
        //表示 将当前列定义为模板列
        type:'template',
        //表示当前这一列使用模板名称
        template:'opt'
      }],
      addCateDialogVisible:false,
      addCateForm: {
        cat_name:'',
        cat_pid:0,
        cat_level:0
      },
      //添加分类表单验证规则
      addCateFormRules:{
        cat_name:[
          {required:true,message:'请输入分类名称',trigger:'blur'}
        ]
      }
    };
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const {data:res} = await this.$http.get('categories',{ params:this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.catelist = res.data.result
      //总数据条数
      this.total = res.data.total
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    showAddCateDialog() {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    //获取父级分类的列表
    async getParentCateList() {
      const {data:res} = await this.$http.get('categories',{params:{type:2}})
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.parentCateList = res.data
    },
    //选择项发送变化触发这个函数
    parentCateChanged() {
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const {data:res} = await this.$http.post('categories',this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功!')
        this.getCateList()
        this.addCateDialogVisible = false
      })
      
    }
  }
}
</script>
<style lang='less' scoped>
.treeTable {
  margin-top: 30px;
}
.el-card {
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>