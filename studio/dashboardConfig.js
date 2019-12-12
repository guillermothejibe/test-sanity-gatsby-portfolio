export default {
  widgets: [
    {
      name: 'sanity-tutorials',
      options: {
        templateRepoId: 'sanity-io/sanity-template-gatsby-portfolio'
      }
    },
    {name: 'structure-menu'},
    {
      name: 'project-info',
      options: {
        __experimental_before: [
          {
            name: 'netlify',
            options: {
              description:
                'NOTE: Because these sites are static builds, they need to be re-deployed to see the changes when documents are published.',
              sites: [
                {
                  buildHookId: '5df2bbfc8a51ee8496173108',
                  title: 'Sanity Studio',
                  name: 'test-sanity-gatsby-portfolio-studio-ibzpxm4o',
                  apiId: '6d36cd4b-1c57-4ec1-9085-5fec7bed8516'
                },
                {
                  buildHookId: '5df2bbfc09f855851d1b9ad6',
                  title: 'Portfolio Website',
                  name: 'test-sanity-gatsby-portfolio-web-d51izr48',
                  apiId: '939705c1-4b9b-452d-af1d-a4005f65d261'
                }
              ]
            }
          }
        ],
        data: [
          {
            title: 'GitHub repo',
            value: 'https://github.com/guillermothejibe/test-sanity-gatsby-portfolio',
            category: 'Code'
          },
          {
            title: 'Frontend',
            value: 'https://test-sanity-gatsby-portfolio-web-d51izr48.netlify.com',
            category: 'apps'
          }
        ]
      }
    },
    {name: 'project-users', layout: {height: 'auto'}},
    {
      name: 'document-list',
      options: {title: 'Recent projects', order: '_createdAt desc', types: ['sampleProject']},
      layout: {width: 'medium'}
    }
  ]
}
