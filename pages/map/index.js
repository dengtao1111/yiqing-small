import * as echarts from '../../ec-canvas/echarts';
// import geoJson from './mapData.js';
import geoJson from './china.js';
const app = getApp();

const dataList = [];
var arr = []; //日期
var arrA = []; //确诊
var arrB = []; //疑似
var arrC = []; //死亡
var arrD = []; //治愈 

Page({

  data: {
    // ec: {
    //   onInit: initChart
    // },
    list: '',
    // 全国疫情
    ec: {
      lazyLoad: true // 延迟加载
    },
    // 疫情趋势
    line: {
      lazyLoad: true // 延迟加载
    },
    date: '', //日期
    suspect: '', //疑似
    death: '', //死亡人数
    cured: '', //治愈人数
    diagnosed: '',//确诊人数
    adddeath: '0', //新增死亡人数
    addcured: '0',
    addsuspect: '0',
    adddiagnosed: '0',
    province: '',
    city: '',
    dw_confirmedCount: '',
    dw_deadCount: '',
    dw_curedCount: '',
    dw1_confirmedCount: '',
    dw1_deadCount: '',
    dw1_curedCount: '',

  },

  onLoad: function(options) {
    
    //加载动画
    wx.showLoading({
      title: '加载中...',
    })
    var that = this;
    //获取位置
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        var locationString = res.latitude + "," + res.longitude;
        wx.request({
          url: 'https://apis.map.qq.com/ws/geocoder/v1/',
          data: {
            'key': 'OBPBZ-L64WW-S7CRV-OWV6V-RBX46-AIBPP',
            'location': locationString
          },
          method: 'GET',
          success: (res) => {
            //存
            wx.setStorageSync('provinceName', res.data.result.address_component.province)
            wx.setStorageSync('city', res.data.result.address_component.city)
            that.setData({
              city: res.data.result.address_component.city,
              province: res.data.result.address_component.province,

            })

          },
          fail: function() {
            console.log('请求失败');
          },
          complete: function() {
            console.log('请求完成');
          }
        })


      }
    })

    // 全国疫情分布图调用
    wx.request({
      url: 'https://api.tianapi.com/txapi/ncovcity/index?key=395c73a804a3aac86034b897584b4cf0',
      success(res) {
        // 两层循环 场景大家可以想着去电影院找人
        for (var i = 0; i < res.data.newslist.length; i++) {
          if (res.data.newslist[i].provinceName == wx.getStorageSync('provinceName')) {
            that.setData({
              dw_confirmedCount: res.data.newslist[i].confirmedCount,
              dw_deadCount: res.data.newslist[i].deadCount,
              dw_curedCount: res.data.newslist[i].curedCount
            })
            for (var j = 0; j < res.data.newslist[i].cities.length; j++) {
              if (res.data.newslist[i].cities[j].cityName + '市' == wx.getStorageSync('city')) {
                that.setData({
                  dw1_confirmedCount: res.data.newslist[i].cities[j].confirmedCount,
                  dw1_deadCount: res.data.newslist[i].cities[j].deadCount,
                  dw1_curedCount: res.data.newslist[i].cities[j].curedCount
                })
              }
            }
          }
        }
        res.data.newslist.forEach(item => {
          item.name = item.provinceShortName;
          item.value = item.confirmedCount
        })
        that.setData({
          list: res.data.newslist
        })

        that.barComponent = that.selectComponent('#mychart-dom-area');
        that.init_map();
        wx.hideLoading();
      }
    });

    // 疫情历史接口
    wx.request({
      url: 'https://wanshun.zmzhi.com/api/default/history',
      success: function(res) {
       console.log(res.data)
        var list = res.data.getChinaTotal.data
        that.setData({
          date: res.data.getAreaInfo_arr.chinaTotalUpdateTime,
          diagnosed: list.chinaTotal.confirm,
          death: list.chinaTotal.dead,
          suspect: list.chinaTotal.suspect,
          cured: list.chinaTotal.heal,
          adddeath: list.chinaDayModify.dead,
          adddiagnosed:list.chinaDayModify.confirm,
          addsuspect: list.chinaDayModify.suspect,
          addcured: list.chinaDayModify.heal,
        })
        arr = res.data.getAreaInfo_arr.chinaHistoryTotal.map(obj => {
          return obj.day
        })
        arrA = res.data.getAreaInfo_arr.chinaHistoryTotal.map(obj => {
          return obj.confirm
        })
        arrB = res.data.getAreaInfo_arr.chinaHistoryTotal.map(obj => {
          return obj.suspect
        })
        arrC = res.data.getAreaInfo_arr.chinaHistoryTotal.map(obj => {
          return obj.dead
        })
        arrD = res.data.getAreaInfo_arr.chinaHistoryTotal.map(obj => {
          return obj.heal
        })
        that.lineComponent = that.selectComponent('#mychart-dom-line');
        that.init_line();
       
      },
    })
  },
  // 全国疫情分布
  init_map: function() {
    this.barComponent.init((canvas, width, height) => {
      // 初始化图表
      const barChart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      canvas.setChart(barChart);
      echarts.registerMap('china', geoJson);
      barChart.setOption(this.getBarOption());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return barChart;
    });

  },
  // 疫情趋势
  init_line: function() {
    this.lineComponent.init((canvas, width, height) => {
      // 初始化图表
      const lineChart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      canvas.setChart(lineChart);

      lineChart.setOption(this.getLineOption());
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return lineChart;
    });

  },
  // 疫情趋势
  getLineOption() {
    return {
      color: ["#D46D21", "#BC371F", "#666666", "#3B8A50"],
      legend: {
        //a确诊 b疑似 c死亡 d治愈
        data: ['确诊', '疑似', '死亡', '治愈'],
        top: 0,
        right: 30,
        backgroundColor: 'white',

      },
      grid: {
        left: '13%', //组件距离容器左边的距离
        right: '13%',
      },
      tooltip: {
        show: true,
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: arr,
        show: true
      },
      yAxis: {
        x: 'center',
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        },
        show: true,
      },
      series: [{
          name: '确诊',
          type: 'line',
          smooth: true,
          data: arrA
        }, {
          name: '疑似',
          type: 'line',
          smooth: true,
          data: arrB
        }, {
          name: '死亡',
          type: 'line',
          smooth: true,
          data: arrC   
        },
        {
          name: '治愈',
          type: 'line',
          smooth: true,
          data: arrD
        }
      ]
    }
  },
  // 全国疫情分布
  getBarOption() {
    return {
      tooltip: {
        show: true,
        formatter: function(params) {
          return params.name + '确诊：' + params.data['value'] + '人'
        },
      },
      //视觉映射
      visualMap: {
        type: 'piecewise',
        left: 'left',
        top: 'bottom',
        pieces: [{
            min: 1000
          },
          {
            min: 500,
            max: 1000
          },
          {
            min: 100,
            max: 499
          },
          {
            min: 10,
            max: 99
          },
          {
            min: 1,
            max: 9
          },
        ],
        color: ['#7A2F11', '#C94D22', '#EE8859', '#F3B494', '#F5DED3']
      },

      series: [{
        type: 'map',
        mapType: 'china',
        label: {
          normal: {
            show: true,
            fontSize: 8,

          },
          emphasis: {
            textStyle: {
              color: '#fff'
            }
          }
        },

        itemStyle: {

          normal: {
            borderColor: '#389BB7',
            areaColor: '#fff',
          },
          emphasis: {
            areaColor: '#F9CE4C',
            borderWidth: 0
          }
        },
        animation: true,
        data: this.data.list

      }]
    }
  },

  onReady() {
    
  },
  onShareAppMessage: function(res) {
    return {
      title: 'DT带你了解疫情情况',
      path: '/pages/map/index',
      success: function() {},
      fail: function() {}
    }
  },
});